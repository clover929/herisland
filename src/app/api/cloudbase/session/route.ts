import {verifiedCloudbaseAccount} from '@/lib/cloudbase/account';
import {CloudbaseDataError} from '@/lib/cloudbase/data';
export async function GET(request:Request){
 const headers={'Cache-Control':'private, no-store',Vary:'Authorization'};
 try{const user=await verifiedCloudbaseAccount(request);return Response.json({user:{id:user.id}},{headers})}
 catch(e){return Response.json({error:e instanceof CloudbaseDataError?e.message:'认证服务暂不可用'},{status:e instanceof CloudbaseDataError?e.status:503,headers})}
}
