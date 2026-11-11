import {AIError} from './provider';
export async function readChatBody(request:Request,signal:AbortSignal){
 const length=Number(request.headers.get('content-length'));if(Number.isFinite(length)&&length>65536)throw new AIError('TOO_LARGE','请求超过64KB',413);
 const reader=request.body?.getReader();if(!reader)throw new AIError('INVALID','缺少请求内容',400);
 const cancel=()=>{void reader.cancel().catch(()=>{})};signal.addEventListener('abort',cancel,{once:true});const chunks:Uint8Array[]=[];let size=0;
 try{signal.throwIfAborted();while(true){const {done,value}=await reader.read();signal.throwIfAborted();if(done)break;size+=value.byteLength;if(size>65536){await reader.cancel();throw new AIError('TOO_LARGE','请求超过64KB',413)}chunks.push(value)}try{return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown}catch{throw new AIError('INVALID','JSON 格式错误',400)}}finally{if(signal.aborted)await reader.cancel().catch(()=>{});signal.removeEventListener('abort',cancel);reader.releaseLock()}
}
export function concurrencyGate(limit=2){let running=0;return {enter(){if(running>=limit)return null;running++;let freed=false;return ()=>{if(!freed){freed=true;running--}}},get running(){return running}}}
