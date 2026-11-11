import {describe,it,expect,vi} from 'vitest';
import {reply,validate,modes} from '../src/features/ai/service';
import {OllamaProvider} from '../src/features/ai/provider';
describe('Sunny',()=>{
 for(const mode of modes.filter(m=>m!=='Explore'))it(mode+' 中文 mock',async()=>{const chat=vi.fn().mockResolvedValue('你好，可以一起梳理。');expect(await reply({mode,messages:[{role:'user',content:'你好'}]},{chat},new AbortController().signal)).toContain('你好');expect(chat.mock.calls[0][0][0].role).toBe('system')});
 for(const value of [null,{}, {mode:'bad',messages:[]},{mode:'Write',messages:[{role:'system',content:'x'}]},{mode:'Write',messages:[{role:'user',content:'a'.repeat(4001)}]}])it('拒绝非法或过长输入',()=>expect(()=>validate(value)).toThrow());
 it('模型不存在',async()=>{vi.stubEnv('OLLAMA_MODEL','test');vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response('',{status:404})));await expect(new OllamaProvider().chat([],new AbortController().signal)).rejects.toMatchObject({code:'MODEL_MISSING'});vi.unstubAllGlobals();vi.unstubAllEnvs()});
 it('未启动',async()=>{vi.stubEnv('OLLAMA_MODEL','test');vi.stubGlobal('fetch',vi.fn().mockRejectedValue(new TypeError()));await expect(new OllamaProvider().chat([],new AbortController().signal)).rejects.toMatchObject({code:'UNAVAILABLE'});vi.unstubAllGlobals();vi.unstubAllEnvs()});
 it('取消与超时信号传递',async()=>{const c=new AbortController();c.abort();const chat=vi.fn(async(_m,signal:AbortSignal)=>{signal.throwIfAborted();return ''});await expect(reply({mode:'Write',messages:[{role:'user',content:'你好'}]},{chat},c.signal)).rejects.toBeDefined()});
});
