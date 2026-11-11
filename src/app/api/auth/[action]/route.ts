import {authJson,AuthInputError} from '@/features/auth/input';
import {NextRequest,NextResponse} from 'next/server';
import {createServerClient,type CookieOptions} from '@supabase/ssr';
import {supabaseConfig,supabaseMode} from '@/lib/supabase/config';
import {allowedOrigin} from '@/features/ai/origin';
export const dynamic='force-dynamic';
export async function GET(request:NextRequest,{params}:{params:Promise<{action:string}>}){const {action}=await params;if(action!=='session')return NextResponse.json({error:'Not found'},{status:404});if(!supabaseMode())return NextResponse.json({user:null,mode:'demo'},{headers:{'Cache-Control':'private, no-store'}});const {serverSupabase}=await import('@/lib/supabase/server');try{const client=await serverSupabase();const {data,error}=await client.auth.getUser();return NextResponse.json({user:error?null:data.user?{id:data.user.id,email:data.user.email}:null},{headers:{'Cache-Control':'private, no-store'}})}catch{return NextResponse.json({error:'认证服务不可用'},{status:503})}}
export async function POST(request:NextRequest,{params}:{params:Promise<{action:string}>}){
 if(!allowedOrigin(request))return NextResponse.json({error:'不允许跨站请求'},{status:403});
 if(!supabaseMode())return NextResponse.json({error:'当前为本地演示，尚未启用真实认证'},{status:503});
 const pending:Array<{name:string;value:string;options:CookieOptions}>=[];
 let status=200,result:Record<string,unknown>={};
 try{if(!/^application\/json(?:;|$)/i.test(request.headers.get('content-type')||''))throw Error('需要JSON');const body=await authJson(request);const {action}=await params;const {url,key}=supabaseConfig();const client=createServerClient(url,key,{cookies:{getAll:()=>request.cookies.getAll(),setAll(values){pending.push(...values)}}});
 const email=typeof body.email==='string'?body.email.trim():'',password=typeof body.password==='string'?body.password:'';
 const origin=process.env.APP_ORIGIN;if(!origin||new URL(origin).origin!==origin)throw Error('请配置APP_ORIGIN');
 if(['register','login','reset'].includes(action)&&(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254))return NextResponse.json({error:'请填写有效邮箱'},{status:400});
 if(['register','update-password'].includes(action)&&(password.length<12||password.length>128))return NextResponse.json({error:'密码长度须为12–128位'},{status:400});
 if(action==='register'){if(body.consent!==true)return NextResponse.json({error:'请确认成年资格与条款'},{status:400});const name=typeof body.displayName==='string'?body.displayName.trim().slice(0,80):'岛屿来客';const {error}=await client.auth.signUp({email,password,options:{emailRedirectTo:origin+'/auth/callback',data:{display_name:name}}});if(error){status=400;result={error:'暂时无法注册，请稍后重试'}}else result={message:'如果邮箱可以注册，验证邮件将发送至该邮箱，请查收后完成验证。'}}
 else if(action==='login'){const {data,error}=await client.auth.signInWithPassword({email,password});if(error||!data.user?.email_confirmed_at){await client.auth.signOut();status=401;result={error:'登录失败，请检查邮箱、密码及邮箱验证状态'}}else result={message:'登录成功'}}
 else if(action==='logout'){const {error}=await client.auth.signOut();if(error)throw error;result={message:'已退出登录'}}
 else if(action==='reset'){const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo:origin+'/auth/callback?next=/auth/reset'});if(error){status=400;result={error:'暂时无法发送重置邮件'}}else result={message:'如果账户存在，密码重置邮件将发送至该邮箱。'}}
 else if(action==='update-password'){const {data,error}=await client.auth.getUser();if(error||!data.user)return NextResponse.json({error:'请先通过有效的密码恢复邮件验证身份'},{status:401});const updated=await client.auth.updateUser({password});if(updated.error){status=400;result={error:'密码更新失败，请重新获取恢复邮件'}}else result={message:'密码已更新'}}
 else return NextResponse.json({error:'Not found'},{status:404});
 }catch(error){status=error instanceof AuthInputError?error.status:503;result={error:'认证服务暂时不可用，请检查配置或稍后重试'}}
 const response=NextResponse.json(result,{status,headers:{'Cache-Control':'private, no-store','Pragma':'no-cache'}});pending.forEach(({name,value,options})=>response.cookies.set(name,value,options));return response;
}
