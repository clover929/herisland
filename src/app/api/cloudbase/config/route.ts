import {cloudbaseConfig} from '@/lib/cloudbase/config';
export const dynamic='force-dynamic';
export async function GET(){try{return Response.json({...cloudbaseConfig(),registrationEnabled:process.env.HERISLAND_PUBLIC_REGISTRATION==='1'},{headers:{'Cache-Control':'no-store'}})}catch{return Response.json({error:'认证环境尚未配置'},{status:503,headers:{'Cache-Control':'no-store'}})}}
