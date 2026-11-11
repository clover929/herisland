import {NextRequest,NextResponse} from 'next/server';
import {serverSupabase} from '@/lib/supabase/server';
import {supabaseMode} from '@/lib/supabase/config';
import {authJson} from '@/features/auth/input';
import {allowedOrigin} from '@/features/ai/origin';
import {parseLayout} from '@/features/pegboard/layout';
export const dynamic='force-dynamic';
export async function POST(request:NextRequest){if(!allowedOrigin(request))return NextResponse.json({error:'不允许跨站请求'},{status:403});if(!supabaseMode())return NextResponse.json({error:'当前是演示模式，未连接云数据库'},{status:503});try{const client=await serverSupabase();const {data}=await client.auth.getUser();if(!data.user)return NextResponse.json({error:'请先登录'},{status:401});const body=await authJson(request);if(body.confirm!==true||body.confirmedUserId!==data.user.id)return NextResponse.json({error:'账户已变化或未确认，请重新核对导入账户'},{status:409});if(typeof body.raw!=='string')throw Error('missing source');const layout=parseLayout(body.raw);const bytes=new TextEncoder().encode(JSON.stringify(layout.items));const hash=Buffer.from(await crypto.subtle.digest('SHA-256',bytes)).toString('hex');const {data:imported,error}=await client.rpc('import_hobby_wall',{layout:layout.items,source_hash:hash,replace_existing:body.replaceExisting===true});if(error)return NextResponse.json({error:'导入未完成：云端已有布局或数据不符合规则。原本地数据未删除。'},{status:409});return NextResponse.json({message:imported?'已导入当前账号，本地原数据仍保留':'此份布局此前已导入，未重复写入'},{headers:{'Cache-Control':'private, no-store'}})}catch{return NextResponse.json({error:'无法导入，请检查配置或本地布局。原数据未删除。'},{status:400})}}
