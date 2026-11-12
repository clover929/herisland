import {verifyCloudbaseIdentity} from './identity';
import {cloudbaseData,CloudbaseDataError} from './data';
/** Provider token validity does not override an application suspension/deletion. */
export async function verifiedCloudbaseAccount(request:Request,verify=verifyCloudbaseIdentity,data=cloudbaseData){
 const result=await verify(request,process.env.NEXT_PUBLIC_CLOUDBASE_ENV_ID??'');
 if(result.status!==200)throw new CloudbaseDataError(result.status,'登录验证未通过，请重新登录');
 const token=request.headers.get('authorization')!.slice(7),id=result.user.id;
 await data('rpc/herisland_ensure_profile',token,'POST',{});
 const profile=await data(`profiles?id=eq.${encodeURIComponent(id)}&select=status`,token);
 if(!Array.isArray(profile)||profile.length!==1||profile[0].status!=='active')throw new CloudbaseDataError(401,'账户已停用或注销');
 return {id,token};
}
