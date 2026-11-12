import {describe,it,expect,vi} from 'vitest';
import {verifiedCloudbaseAccount} from '../src/lib/cloudbase/account';
import {CloudbaseDataError} from '../src/lib/cloudbase/data';
const request=new Request('https://site.test',{headers:{Authorization:'Bearer test-token'}});
const verified=async()=>({status:200 as const,user:{id:'verified-user'}});
describe('Application account status overrides still-valid provider tokens',()=>{
 it.each(['deleted','suspended'])('rejects an inactive %s account',async status=>{const data=vi.fn().mockResolvedValueOnce(null).mockResolvedValueOnce([{status}]);await expect(verifiedCloudbaseAccount(request,verified,data)).rejects.toMatchObject({status:401})});
 it('fails closed when invitation/database validation is unavailable',async()=>{const data=vi.fn().mockRejectedValue(new CloudbaseDataError(503));await expect(verifiedCloudbaseAccount(request,verified,data)).rejects.toMatchObject({status:503})});
 it('uses the verified ID and passes the user token through RLS',async()=>{const data=vi.fn().mockResolvedValueOnce(null).mockResolvedValueOnce([{status:'active'}]);expect(await verifiedCloudbaseAccount(request,verified,data)).toEqual({id:'verified-user',token:'test-token'});expect(data.mock.calls[1][0]).toContain('id=eq.verified-user')});
});
