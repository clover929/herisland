import {execFileSync} from 'node:child_process';
import {randomBytes} from 'node:crypto';
import {mkdirSync,writeFileSync,existsSync} from 'node:fs';
const target='artifacts/release/cloudbase-test-accounts.json',env='herisland-staging-d8dnse0ea80165';
if(existsSync(target))throw Error('Test accounts already exist; reuse the private local record');
mkdirSync('artifacts/release',{recursive:true});const accounts=[];
for(const tag of ['a','b']){
 const username=`herislandqa-${tag}-${randomBytes(4).toString('hex')}`,password=randomBytes(12).toString('base64url')+'aA1!';
 try{execFileSync('npm',['exec','--yes','--package=@cloudbase/cli','--','tcb','user','create',username,'-e',env,'--type','externalUser','--password',password,'--nickname','上线验收账号（虚构测试）','--json'],{encoding:'utf8',stdio:['ignore','pipe','pipe']})}catch(error){let message='unknown CLI error';try{message=JSON.parse(String(error.stdout)).error?.message||message}catch{}console.error(String(message).replaceAll(password,'[redacted]').slice(0,500));process.exit(1)}
 accounts.push({username,password});writeFileSync(target,JSON.stringify({env,accounts},null,2),{mode:0o600});
 console.log(`Created staging test account ${tag}; credentials saved only in ignored local artifact.`);
}
