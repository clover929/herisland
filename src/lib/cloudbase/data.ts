import {cloudbaseConfig} from './config';
export class CloudbaseDataError extends Error{constructor(public status:number,message='云端操作未完成，请稍后重试'){super(message)}}
/** Forward the user's verified token, never a service-role key, so RLS remains effective. */
export async function cloudbaseData(path:string,token:string|undefined,method='GET',body?:unknown){
 const {env,accessKey}=cloudbaseConfig();
 const response=await fetch(`https://${env}.api.tcloudbasegateway.com/v1/rdb/rest/${path}`,{method,headers:{Authorization:`Bearer ${token||accessKey}`,'Content-Type':'application/json',Prefer:'return=representation'},...(body===undefined?{}:{body:JSON.stringify(body)}),cache:'no-store',redirect:'error',signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw new CloudbaseDataError(response.status===401?401:response.status===403?403:response.status<500?409:503);
 const text=await response.text();return text?JSON.parse(text):null;
}
