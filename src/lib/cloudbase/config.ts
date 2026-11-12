/** Only public environment identifiers belong in browser configuration. */
export function cloudbaseConfig(){
 const env=process.env.NEXT_PUBLIC_CLOUDBASE_ENV_ID;
 const region=process.env.NEXT_PUBLIC_CLOUDBASE_REGION;
 const accessKey=process.env.NEXT_PUBLIC_CLOUDBASE_PUBLISHABLE_KEY;
 if(!env||!region||!accessKey)throw new Error('CloudBase尚未配置完成，未启用真实账户');
 if(region!=='ap-shanghai')throw new Error('本阶段仅允许已确认的上海环境');
 if(env!=='herisland-staging-d8dnse0ea80165')throw new Error('CloudBase目标不是已确认的staging环境');
 return {env,region,accessKey};
}
