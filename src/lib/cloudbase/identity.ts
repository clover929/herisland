/** Verify every request with the identity service; never decode a JWT as proof. */
export async function verifyCloudbaseIdentity(request:Request,env:string,send:typeof fetch=fetch){
 const authorization=request.headers.get('authorization');
 if(!authorization||!/^Bearer [A-Za-z0-9._~-]{1,8192}$/.test(authorization))return {status:401 as const};
 if(env!=='herisland-staging-d8dnse0ea80165')return {status:503 as const};
 try{
  const response=await send(`https://${env}.api.tcloudbasegateway.com/auth/v1/user/me`,{headers:{Authorization:authorization},cache:'no-store',redirect:'error',signal:AbortSignal.timeout(10000)});
  if(response.status===401||response.status===403)return {status:401 as const};
  if(!response.ok)return {status:503 as const};
  const profile:unknown=await response.json();
  if(!profile||typeof profile!=='object')return {status:503 as const};
  const p=profile as Record<string,unknown>;
  if(typeof p.sub!=='string'||!p.sub||p.sub.length>64||p.status!=='ACTIVE'||(p.user_id!==undefined&&p.user_id!==p.sub))return {status:401 as const};
  // Return only the identity needed by business handlers, not email/phone/roles.
  return {status:200 as const,user:{id:p.sub}};
 }catch{return {status:503 as const}}
}
