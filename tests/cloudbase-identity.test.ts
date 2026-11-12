import {describe,it,expect,vi} from 'vitest';
import {verifyCloudbaseIdentity} from '../src/lib/cloudbase/identity';
const env='herisland-staging-d8dnse0ea80165';
const request=()=>new Request('https://example.test/api/cloudbase/session',{headers:{authorization:'Bearer test-token'}});
describe('CloudBase server identity boundary',()=>{
 it('does not call the service without a bearer token',async()=>{const send=vi.fn();expect((await verifyCloudbaseIdentity(new Request('https://example.test'),env,send)).status).toBe(401);expect(send).not.toHaveBeenCalled()});
 it('does not trust a caller-supplied user ID or disclose private profile fields',async()=>{const send=vi.fn().mockResolvedValue(Response.json({sub:'verified',user_id:'verified',status:'ACTIVE',email:'private@example.test',groups:[{id:'admin'}]}));expect(await verifyCloudbaseIdentity(request(),env,send)).toEqual({status:200,user:{id:'verified'}});expect(send.mock.calls[0][1].redirect).toBe('error')});
 it.each([{sub:'x',status:'DISABLED'},{sub:'x',user_id:'y',status:'ACTIVE'},{}])('rejects invalid or disabled identities',async profile=>{expect((await verifyCloudbaseIdentity(request(),env,vi.fn().mockResolvedValue(Response.json(profile)))).status).toBe(401)});
 it('fails closed when the service is unavailable',async()=>{expect((await verifyCloudbaseIdentity(request(),env,vi.fn().mockRejectedValue(new Error('network')))).status).toBe(503)});
 it('rejects remote authentication failure',async()=>{expect((await verifyCloudbaseIdentity(request(),env,vi.fn().mockResolvedValue(new Response(null,{status:401})))).status).toBe(401)});
});
