'use client';
import {browserCloudbase} from '@/lib/cloudbase/browser';
export const cloudbaseMode=()=>process.env.NEXT_PUBLIC_DATA_MODE==='cloudbase';
export async function communityRequest(action?:Record<string,unknown>){
 const {data,error}=await (await browserCloudbase()).auth.getSession();
 if(error)throw new Error('会话读取失败，请重新登录');
 const token=data.session?.access_token;
 const response=await fetch('/api/cloudbase/community',{method:action?'POST':'GET',headers:{...(token?{Authorization:`Bearer ${token}`} :{}),...(action?{'Content-Type':'application/json'}:{})},...(action?{body:JSON.stringify(action)}:{}),cache:'no-store'});
 const body=await response.json();if(!response.ok)throw new Error(body.error||'云端操作失败');return body;
}
