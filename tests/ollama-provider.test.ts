import {afterEach,it,expect,vi} from 'vitest';
import {AIError,OllamaProvider} from '../src/features/ai/provider';

afterEach(()=>{vi.restoreAllMocks();vi.unstubAllGlobals();vi.unstubAllEnvs()});

it('requests separated thinking and returns only the final Ollama content',async()=>{
 vi.stubEnv('AI_PROVIDER','ollama');
 vi.stubEnv('OLLAMA_BASE_URL','http://127.0.0.1:11434');
 vi.stubEnv('OLLAMA_MODEL','qwen3:4b');
 let requestBody:Record<string,unknown>|undefined;
 vi.stubGlobal('fetch',vi.fn(async(_input:RequestInfo|URL,init?:RequestInit)=>{
  requestBody=JSON.parse(String(init?.body)) as Record<string,unknown>;
  return Response.json({message:{role:'assistant',thinking:'不得展示的推理草稿',content:'你好，我是小晴。'},done_reason:'stop'});
 }));
 const answer=await new OllamaProvider().chat([{role:'system',content:'persona'}, {role:'user',content:'你好'}],new AbortController().signal);
 expect(answer).toBe('你好，我是小晴。');
 expect(requestBody).toMatchObject({model:'qwen3:4b',stream:false,think:true,options:{num_predict:1536},messages:[{role:'system',content:'persona'},{role:'user',content:'你好'}]});
 expect(answer).not.toContain('推理草稿');
});

it('rejects a token-limited response instead of showing a partial answer',async()=>{
 vi.stubEnv('AI_PROVIDER','ollama');
 vi.stubEnv('OLLAMA_BASE_URL','http://127.0.0.1:11434');
 vi.stubEnv('OLLAMA_MODEL','qwen3:4b');
 vi.stubGlobal('fetch',vi.fn(async()=>Response.json({message:{role:'assistant',thinking:'private trace',content:'partial'},done_reason:'length'})));
 await expect(new OllamaProvider().chat([{role:'user',content:'test'}],new AbortController().signal)).rejects.toMatchObject({code:'INCOMPLETE'} satisfies Partial<AIError>);
});

it('allows an incomplete Explore selector result for the existing source-only fallback',async()=>{
 vi.stubEnv('AI_PROVIDER','ollama');
 vi.stubEnv('OLLAMA_BASE_URL','http://127.0.0.1:11434');
 vi.stubEnv('OLLAMA_MODEL','qwen3:4b');
 vi.stubGlobal('fetch',vi.fn(async()=>Response.json({message:{role:'assistant',thinking:'private trace',content:''},done_reason:'length'})));
 const result=await new OllamaProvider().chat([{role:'system',content:'selector'},{role:'user',content:'question'}],new AbortController().signal,{think:true,numPredict:768,allowIncomplete:true});
 expect(result).toBe('');
});
