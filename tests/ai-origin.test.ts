import {it,expect} from 'vitest';
import {allowedOrigin} from '../src/features/ai/origin';
function request(origin:string,host='127.0.0.1:3000',url='http://localhost:3000/api/ai/chat'){return new Request(url,{headers:{origin,host}})}
it('Next dev normalizes URL but legitimate IPv4 Origin remains allowed',()=>expect(allowedOrigin(request('http://127.0.0.1:3000'),true)).toBe(true));
it('localhost and IPv6 loopback aliases on same port',()=>{expect(allowedOrigin(request('http://localhost:3000'),true)).toBe(true);expect(allowedOrigin(request('http://[::1]:3000','[::1]:3000'),true)).toBe(true)});
for(const origin of ['https://evil.example','http://localhost.evil.example:3000','http://127.0.0.2:3000','http://localhost:3001','https://127.0.0.1:3000','null','garbage','http://127.0.0.1:3000/path','http://user@localhost:3000'])it('reject '+origin,()=>expect(allowedOrigin(request(origin),true)).toBe(false));
it('production remains strict',()=>{expect(allowedOrigin(request('http://127.0.0.1:3000'),false)).toBe(false);expect(allowedOrigin(request('https://herspace.example','herspace.example','https://herspace.example/api/ai/chat'),false)).toBe(true)});
it('nonlocal Host or target cannot enable alias exception',()=>{expect(allowedOrigin(request('http://127.0.0.1:3000','evil.example:3000'),true)).toBe(false);expect(allowedOrigin(request('http://127.0.0.1:3000','127.0.0.1:3000','http://evil.example:3000/api/ai/chat'),true)).toBe(false)});
it('CLI without Origin remains supported',()=>expect(allowedOrigin(new Request('http://localhost:3000/api/ai/chat'),true)).toBe(true));
