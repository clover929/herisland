import {readChatBody,concurrencyGate} from '@/features/ai/request-body';
import {allowedOrigin} from '@/features/ai/origin';
import {AIError,OllamaProvider} from '@/features/ai/provider';
import {reply} from '@/features/ai/service';
export const runtime='nodejs';
const hits:number[]=[];const gate=concurrencyGate(1);
export async function POST(request:Request){
 const controller=new AbortController();let timeout=false;let release:(()=>void)|null=null;
 const cancel=()=>controller.abort();request.signal.addEventListener('abort',cancel,{once:true});if(request.signal.aborted)cancel();
 const timer=setTimeout(()=>{timeout=true;controller.abort()},90000);
 try{
 if(!allowedOrigin(request))throw new AIError('ORIGIN','不允许跨站请求',403);
 if((process.env.VERCEL==='1'||process.env.HERISLAND_HOSTED_DEMO==='1'))throw new AIError('CLOUD_AI_NOT_CONFIGURED','公网版本尚未配置云端AI，本机Ollama无法从公网服务器访问。',503);
 const now=Date.now();while(hits.length&&hits[0]<now-60000)hits.shift();if(hits.length>=20)throw new AIError('RATE_LIMIT','请求频繁，请稍后重试',429);hits.push(now);
 if(!/^application\/json(?:\s*;|\s*$)/i.test(request.headers.get('content-type')||''))throw new AIError('INVALID','需要 JSON 请求',400);
 release=gate.enter();if(!release)throw new AIError('BUSY','本地模型正在处理其他请求，请稍后重试',429);
 const data=await readChatBody(request,controller.signal);
 const content=await reply(data,new OllamaProvider(),controller.signal);
 return Response.json({message:{role:'assistant',content}},{headers:{'Cache-Control':'no-store'}});
 }catch(e){const error=controller.signal.aborted?new AIError(timeout?'TIMEOUT':'CANCELLED',timeout?'本地模型响应超时，请重试':'已取消生成',timeout?504:499):e instanceof AIError?e:new AIError('INTERNAL','暂时无法回复，请重试',500);return Response.json({error:{code:error.code,message:error.message}},{status:error.status,headers:{'Cache-Control':'no-store'}})}finally{release?.();clearTimeout(timer);request.signal.removeEventListener('abort',cancel)}
}
