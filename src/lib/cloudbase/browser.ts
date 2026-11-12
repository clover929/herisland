'use client';
import cloudbase from '@cloudbase/js-sdk';
let app:Promise<ReturnType<typeof cloudbase.init>>|undefined;
/** A single SDK client; local browser state never authorizes server writes. */
export async function browserCloudbase(){
 if(typeof window==='undefined')throw new Error('CloudBase浏览器客户端不能在服务端初始化');
 if(!app)app=(async()=>{const response=await fetch('/api/cloudbase/config',{cache:'no-store'});if(!response.ok)throw new Error('CloudBase尚未配置完成');const config=await response.json();if(config.env!=='herisland-staging-d8dnse0ea80165'||config.region!=='ap-shanghai'||typeof config.accessKey!=='string')throw new Error('CloudBase环境配置无效');return cloudbase.init({env:config.env,region:config.region,accessKey:config.accessKey,auth:{detectSessionInUrl:false}})})().catch(error=>{app=undefined;throw error});
 return app;
}
