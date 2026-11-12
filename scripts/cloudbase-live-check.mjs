import {readFileSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const record=JSON.parse(readFileSync('artifacts/release/cloudbase-test-accounts.json','utf8'));
const gateway=`https://${record.env}.api.tcloudbasegateway.com`,origin=process.env.HERISLAND_TEST_ORIGIN||'http://127.0.0.1:3305';
const checks=[];let moderator;
function sql(statement){execFileSync('npm',['exec','--yes','--package=@cloudbase/cli','--','tcb','db','execute','-e',record.env,'--sql',statement,'--json'],{stdio:['ignore','pipe','pipe']})}
async function call(token,action){const response=await fetch(origin+'/api/cloudbase/community',{method:action?'POST':'GET',headers:{Authorization:`Bearer ${token}`,...(action?{'Content-Type':'application/json'}:{})},...(action?{body:JSON.stringify(action)}:{})});return {status:response.status,body:await response.json()}}
async function db(token,path,method,body){const response=await fetch(gateway+'/v1/rdb/rest/'+path,{method,headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json',Prefer:'return=representation'},...(body?{body:JSON.stringify(body)}:{})});return {status:response.status,body:await response.json()}}
try{
 for(const account of record.accounts){const r=await fetch(gateway+'/auth/v1/signin',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({client_id:record.env,username:account.username,password:account.password})});const session=await r.json();assert.equal(r.status,200,'CloudBase sign in');assert.ok(session.access_token);account.token=session.access_token;const snapshot=await call(account.token);assert.equal(snapshot.status,200,'verified community snapshot');account.id=snapshot.body.user.id;assert.match(account.id,/^[a-zA-Z0-9_-]{1,64}$/)}
 const [a,b]=record.accounts;
 assert.equal((await call(a.token,{action:'profile',displayName:'云端验收 A（虚构测试）',bio:'自动验收账号，非真实社区用户'})).status,200);checks.push('真实登录与资料保存');
 const created=await call(a.token,{action:'post',title:'自动验收内容：账户隔离',content:'仅供系统验收，非真实社区讨论。',category:'兴趣与创作',mode:'开放讨论'});assert.equal(created.status,200,'create draft');const pid=created.body.data[0].id;
 assert.ok((await call(a.token)).body.posts.some(p=>p.id===pid));assert.ok(!(await call(b.token)).body.posts.some(p=>p.id===pid));checks.push('待审核帖子只对本人可见');
 const forged=await db(b.token,'posts','POST',{author_id:a.id,title:'伪造所有者测试',content:'禁止保存',status:'draft'});assert.ok(forged.status>=400,'RLS blocks forged ownership');
 const bypass=await db(a.token,`posts?id=eq.${pid}`,'PATCH',{status:'published'});assert.ok(bypass.status>=400,'RLS blocks self approval');checks.push('直接绕过接口仍不能伪造作者或自行审核');
 assert.notEqual((await call(b.token,{action:'review'})).status,200,'moderator access denied');
 moderator=a.id;sql(`insert into app_private.admins(user_id) values('${a.id}') on conflict do nothing`);
 assert.equal((await call(a.token,{action:'moderate',targetType:'post',id:pid,decision:'approve',reason:'自动验收后立即隐藏'})).status,200,'moderation approval');
 assert.ok((await call(b.token)).body.posts.some(p=>p.id===pid));checks.push('审核后其他账户可见');
 assert.equal((await call(b.token,{action:'comment',id:pid,content:'自动验收评论（虚构）'})).status,200,'comment stored');
 assert.equal((await call(b.token,{action:'bookmark',id:pid})).status,200,'bookmark stored');assert.ok((await call(b.token)).body.bookmarks.some(p=>p.post_id===pid));assert.ok(!(await call(a.token)).body.bookmarks.some(p=>p.post_id===pid));checks.push('评论持久保存、收藏按用户隔离');
 assert.equal((await call(b.token,{action:'report',targetType:'post',id:pid,reason:'自动验收举报，验收后处理'})).status,200,'report stored');const review=await call(a.token,{action:'review'});assert.ok(review.body.data.reports.some(r=>r.target_id===pid));checks.push('举报进入真实审核队列');
 const revision=Number((await call(a.token)).body.wallRevision);assert.equal((await call(a.token,{action:'wall',layout:{version:3,items:[]},revision})).status,200,'wall RPC');const tooMany=await db(a.token,'rpc/herisland_save_wall','POST',{layout:Array(6).fill({}),expected_revision:revision+1});assert.ok(tooMany.status>=400);const stale=await call(a.token,{action:'wall',layout:{version:3,items:[]},revision});assert.ok(stale.status>=400,'stale wall writes rejected');checks.push('洞洞板事务保存与数据库五件上限');
 assert.equal((await call(a.token,{action:'moderate',targetType:'post',id:pid,decision:'hide',reason:'自动验收完成，隐藏合成数据'})).status,200);assert.ok(!(await call(b.token)).body.posts.some(p=>p.id===pid));checks.push('隐藏后停止公开');
 // Keep the test accounts for the browser acceptance run; never store session tokens.
 writeFileSync('artifacts/release/cloudbase-test-accounts.json',JSON.stringify({env:record.env,accounts:record.accounts.map(({username,password,id})=>({username,password,id}))},null,2),{mode:0o600});
 writeFileSync('artifacts/release/cloudbase-live-result.json',JSON.stringify({passed:true,checks},null,2));console.log(JSON.stringify({passed:true,checks}));
}catch(error){console.error(JSON.stringify({passed:false,error:error instanceof assert.AssertionError?error.message:String(error?.message||'live check failed')}));process.exitCode=1}
finally{if(moderator)try{sql(`delete from app_private.admins where user_id='${moderator}'`)}catch{console.error('Temporary QA moderator removal failed; operator attention required');process.exitCode=1}}
