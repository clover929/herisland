export type Message={role:'user'|'assistant';content:string};
export class AIError extends Error {constructor(public code:string,message:string,public status=503){super(message)}}
export type ProviderOptions={think?:boolean;numPredict?:number;allowIncomplete?:boolean};
export interface Provider {chat(messages:{role:string;content:string}[],signal:AbortSignal,options?:ProviderOptions):Promise<string>}
export class OllamaProvider implements Provider {
 async chat(messages:{role:string;content:string}[],signal:AbortSignal,options:ProviderOptions={}){
 const base=new URL(process.env.OLLAMA_BASE_URL||'http://127.0.0.1:11434');
 if(base.protocol!=='http:'||!['127.0.0.1','[::1]','localhost'].includes(base.hostname))throw new AIError('CONFIG','仅允许本机回环地址');
 if(process.env.AI_PROVIDER&&process.env.AI_PROVIDER!=='ollama')throw new AIError('CONFIG','仅支持本地 Ollama');
 const model=process.env.OLLAMA_MODEL;if(!model)throw new AIError('CONFIG','请配置 OLLAMA_MODEL');
 let response:Response;try{response=await fetch(new URL('/api/chat',base),{method:'POST',redirect:'error',headers:{'Content-Type':'application/json'},body:JSON.stringify({model,messages,stream:false,think:options.think??true,options:{num_predict:options.numPredict??1536}}),signal})}catch(e){if(signal.aborted)throw e;throw new AIError('UNAVAILABLE','无法连接本地 Ollama，请先运行 ollama serve')}
 if(response.status===404)throw new AIError('MODEL_MISSING','本地模型尚未下载，请在本机检查已配置的模型');
 if(!response.ok)throw new AIError('UPSTREAM','本地模型暂时无法回复，请重试');
 const data=await response.json();if(data.done_reason==='length'&&!options.allowIncomplete)throw new AIError('INCOMPLETE','小晴这次没有完成回复，请缩短问题后重试。');if(typeof data.message?.content!=='string'||!data.message.content.trim()){if(options.allowIncomplete)return '';throw new AIError('EMPTY','模型没有生成可显示的最终回复，请重试')}const content=data.message.content.trim();if(/<think>|<\/think>|^(首先[，,]?)?\s*用户(?:问|说|要求|消息)|^好的[，,]?(?:首先|用户)|回应草稿[：:]|最终回应草稿[：:]/.test(content)){if(options.allowIncomplete)return '';throw new AIError('INCOMPLETE','小晴这次没有生成完整回复，请重新发送。')}return content;
 }
}
