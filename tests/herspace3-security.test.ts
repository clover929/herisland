import {it,expect} from 'vitest';
import {readChatBody,concurrencyGate} from '../src/features/ai/request-body';
import {allowedOrigin} from '../src/features/ai/origin';
import {contextFor} from '../src/features/ai/chat-store';
import {validDraft} from '../src/features/posts/post-editor';
it('bounded concurrency releases each slot once',()=>{const g=concurrencyGate(2);const a=g.enter()!,b=g.enter()!;expect(g.enter()).toBeNull();a();a();expect(g.running).toBe(1);const c=g.enter();expect(c).not.toBeNull();b();c!();expect(g.running).toBe(0)});
it('single local model slot rejects overlapping inference until release',()=>{const g=concurrencyGate(1);const active=g.enter()!;expect(g.enter()).toBeNull();active();const retry=g.enter();expect(retry).not.toBeNull();retry!();expect(g.running).toBe(0)});
it('valid JSON, malformed JSON and oversized chunks',async()=>{expect(await readChatBody(new Request('http://localhost',{method:'POST',body:'{"mode":"Write"}'}),new AbortController().signal)).toEqual({mode:'Write'});await expect(readChatBody(new Request('http://localhost',{method:'POST',body:'{'}),new AbortController().signal)).rejects.toMatchObject({code:'INVALID'});await expect(readChatBody(new Request('http://localhost',{method:'POST',body:'x'.repeat(65537)}),new AbortController().signal)).rejects.toMatchObject({code:'TOO_LARGE'})});
it('slow body is cancelled on timeout/abort',async()=>{let cancelled=false;const stream=new ReadableStream({cancel(){cancelled=true}});const request=new Request('http://localhost',{method:'POST',body:stream,duplex:'half'} as RequestInit);const c=new AbortController();const result=readChatBody(request,c.signal);c.abort();await expect(result).rejects.toBeDefined();expect(cancelled).toBe(true)});
it('browser cross-site metadata is rejected even without Origin',()=>expect(allowedOrigin(new Request('http://localhost',{headers:{'sec-fetch-site':'cross-site'}}),true)).toBe(false));
it('context keeps complete recent pairs within existing limits',()=>{const history=Array.from({length:31},(_,i)=>({role:i%2===0?'user' as const:'assistant' as const,content:'中'.repeat(1500)}));const context=contextFor(history);expect(context[0].role).toBe('user');expect(context.at(-1)?.role).toBe('user');expect(context.length).toBeLessThanOrEqual(15);expect(context.reduce((n,m)=>n+m.content.length,0)).toBeLessThanOrEqual(16000);expect(history).toHaveLength(31)});
it('new post validation enforces lengths and real enums',()=>{const d={title:' 标题 ',content:' 正文 ',category:'职业与工作',mode:'开放讨论'};expect(validDraft(d)).toBe(true);for(const bad of [{...d,title:' '},{...d,content:'x'.repeat(10001)},{...d,category:'非法'},{...d,mode:'非法'}])expect(validDraft(bad)).toBe(false)});

import {womenReturn} from '../src/features/women/return-link';
it('person return links only allow the existing women directory',()=>{expect(womenReturn('/women?q=Marie&page=2')).toBe('/women?q=Marie&page=2');for(const bad of ['https://evil.example','//evil.example','/women-evil','/discussions'])expect(womenReturn(bad)).toBe('/women')});
import {validate} from '../src/features/ai/service';
it('chat validation strips unknown model-message fields',()=>{expect(validate({mode:'Write',messages:[{role:'user',content:'你好',images:['fake'],tool_calls:[{name:'publish'}]}]})).toEqual({mode:'Write',messages:[{role:'user',content:'你好'}]})});
