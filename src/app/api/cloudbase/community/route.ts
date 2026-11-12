import {cloudbaseData,CloudbaseDataError} from '@/lib/cloudbase/data';
import {verifiedCloudbaseAccount} from '@/lib/cloudbase/account';
import {cloudbaseAllowedOrigin} from '@/lib/cloudbase/origin';
import {categories} from '@/data';
import {parseLayout} from '@/features/pegboard/layout';
const respond=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'private, no-store',Vary:'Authorization'}});
const enabled=()=>process.env.NEXT_PUBLIC_DATA_MODE==='cloudbase';
async function identity(request:Request){if(!request.headers.get('authorization'))return null;return verifiedCloudbaseAccount(request)}
export async function GET(request:Request){
 if(!enabled())return respond({error:'真实社区尚未启用'},503);
 try{
  const user=await identity(request),token=user?.token;
  const [posts,comments,profiles,communities,bookmarks,memberships,wall,moderator,wallRevision]=await Promise.all([
   cloudbaseData('posts?select=id,author_id,title,content,category,discussion_mode,status,created_at&order=created_at.desc&limit=100',token),
   cloudbaseData('comments?select=id,post_id,author_id,content,created_at&order=created_at.asc&limit=500',token),
   cloudbaseData('profiles?select=id,display_name,bio,status&limit=500',token),
   cloudbaseData('communities?select=id,legacy_key,name,description&order=legacy_key',token),
   user?cloudbaseData('bookmarks?select=id,post_id',token):[],user?cloudbaseData('community_members?select=id,community_id',token):[],
   user?cloudbaseData('user_hobby_wall?select=item_id,x,y,scale,rotation,mount_type&order=slot',token):[],
   user?cloudbaseData('rpc/herisland_is_moderator',token,'POST',{}):false,
   user?cloudbaseData('rpc/herisland_wall_revision',token,'POST',{}):0
  ]);
  return respond({user:user?{id:user.id}:null,posts,comments,profiles,communities,bookmarks,memberships,wall,moderator,wallRevision});
 }catch(e){return respond({error:e instanceof CloudbaseDataError?e.message:'云端数据暂不可用'},e instanceof CloudbaseDataError?e.status:503)}
}
export async function POST(request:Request){
 if(!enabled())return respond({error:'真实社区尚未启用'},503);
 if(!cloudbaseAllowedOrigin(request))return respond({error:'不允许跨站操作，或网站来源尚未配置'},403);
 try{
  const user=await identity(request);if(!user)return respond({error:'请先登录'},401);
  if(!/^application\/json(?:;|$)/i.test(request.headers.get('content-type')||''))return respond({error:'需要JSON请求'},415);
  const reader=request.body?.getReader();if(!reader)return respond({error:'缺少请求内容'},400);const chunks:Uint8Array[]=[];let size=0;
  try{while(true){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>65536){await reader.cancel();return respond({error:'请求过大'},413)}chunks.push(value)}}finally{reader.releaseLock()}
  const parsed:unknown=JSON.parse(Buffer.concat(chunks).toString('utf8'));if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))return respond({error:'请求格式无效'},400);const b=parsed as Record<string,unknown>;
  const text=(key:string,max:number)=>{const value=b[key];if(typeof value!=='string'||!value.trim()||value.trim().length>max)throw new CloudbaseDataError(400,'输入格式不正确');return value.trim()};
  const id=()=>{const value=text('id',64);if(!/^[0-9a-f-]{36}$/i.test(value))throw new CloudbaseDataError(400);return value};
  const data=(path:string,method='POST',body?:unknown)=>cloudbaseData(path,user.token,method,body);
  let result:unknown=null;
  switch(b.action){
   case 'post':{const category=text('category',80),mode=text('mode',40);if(!categories.includes(category)||!['倾听模式','求助模式','开放讨论','资源征集'].includes(mode))return respond({error:'分类或模式无效'},400);result=await data('posts','POST',{author_id:user.id,title:text('title',100),content:text('content',10000),category,discussion_mode:mode,status:'draft'});break}
   case 'comment':result=await data('comments','POST',{post_id:id(),author_id:user.id,content:text('content',2000)});break;
   case 'bookmark':{const pid=id();result=b.remove===true?await data(`bookmarks?user_id=eq.${encodeURIComponent(user.id)}&post_id=eq.${pid}`,'DELETE'):await data('bookmarks','POST',{post_id:pid,user_id:user.id});break}
   case 'membership':{const cid=id();result=b.remove===true?await data(`community_members?user_id=eq.${encodeURIComponent(user.id)}&community_id=eq.${cid}`,'DELETE'):await data('community_members','POST',{community_id:cid,user_id:user.id});break}
   case 'profile':{const bio=typeof b.bio==='string'?b.bio:'';if(bio.length>1000)return respond({error:'简介过长'},400);result=await data(`profiles?id=eq.${encodeURIComponent(user.id)}`,'PATCH',{display_name:text('displayName',80),bio});if(!Array.isArray(result)||result.length!==1)throw new CloudbaseDataError(409,'资料未保存，请检查账户状态');break}
   case 'wall':{const layout=parseLayout(JSON.stringify(b.layout));if(!Number.isSafeInteger(b.revision)||Number(b.revision)<0)return respond({error:'请刷新后重新保存布局'},409);result=await data('rpc/herisland_save_wall','POST',{layout:layout.items,expected_revision:b.revision});break}
   case 'report':{if(!['post','comment','user'].includes(String(b.targetType)))return respond({error:'举报类型无效'},400);result=await data('reports','POST',{reporter_id:user.id,target_type:b.targetType,target_id:text('id',64),reason:text('reason',2000)});break}
   case 'review':result=await data('rpc/herisland_review_queue','POST',{});break;
   case 'moderate':result=await data('rpc/herisland_moderate','POST',{target_kind:text('targetType',20),target:text('id',64),decision:text('decision',20),reason_text:text('reason',2000)});break;
   case 'delete-account':if(b.confirm!=='注销我的账户')return respond({error:'请输入确认文字'},400);result=await data('rpc/herisland_request_deletion','POST',{});break;
   default:return respond({error:'操作不存在'},404);
  }
  return respond({data:result});
 }catch(e){return respond({error:e instanceof CloudbaseDataError?e.message:'云端保存失败，未显示为成功'},e instanceof CloudbaseDataError?e.status:e instanceof SyntaxError?400:503)}
}
