import {describe,it,expect} from 'vitest';
import {cloudbaseAllowedOrigin} from '../src/lib/cloudbase/origin';
const external='https://herisland.example';
const request=(origin:string,extra:Record<string,string>={})=>new Request('http://localhost:3000/api/cloudbase/community',{headers:{origin,...extra}});
describe('Cloud Run external origin boundary',()=>{
 it('accepts exact configured HTTPS origin behind internal HTTP',()=>expect(cloudbaseAllowedOrigin(request(external),external)).toBe(true));
 it('rejects cross-site and forwarded-host spoofing',()=>{expect(cloudbaseAllowedOrigin(request('https://attacker.example',{'x-forwarded-host':'herisland.example'}),external)).toBe(false);expect(cloudbaseAllowedOrigin(request(external,{'sec-fetch-site':'cross-site'}),external)).toBe(false)});
 it('fails closed without a canonical external origin',()=>{for(const value of ['',external+'/',external+'/path','http://public.example'])expect(cloudbaseAllowedOrigin(request(external),value)).toBe(false)});
 it('supports explicit loopback production-preview origin',()=>expect(cloudbaseAllowedOrigin(request('http://127.0.0.1:3305'),'http://127.0.0.1:3305')).toBe(true));
});
