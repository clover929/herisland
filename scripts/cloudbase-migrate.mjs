import {readFileSync,readdirSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const env='herisland-staging-d8dnse0ea80165';
if(!process.argv.includes('--apply'))throw Error('Use --apply only for the authorized staging environment');
const quote=s=>"'"+s.replaceAll("'","''")+"'";
function execute(sql){
 const output=execFileSync('npm',['exec','--yes','--package=@cloudbase/cli','--','tcb','db','execute','-e',env,'--sql',sql,'--json'],{encoding:'utf8',maxBuffer:8*1024*1024});
 const parsed=JSON.parse(output);if(parsed.error||!parsed.data||parsed.data.Error)throw Error('CloudBase SQL failed');return (parsed.data.Rows||[]).map(row=>typeof row==='string'?JSON.parse(row):row);
}
const files=readdirSync('cloudbase/migrations').filter(f=>f.endsWith('.sql')).sort();
const ledger=String(execute("SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema='app_private' AND table_name='migration_history')")[0]?.[0])==='true';
if(!ledger&&Number(execute("SELECT count(*)::int FROM information_schema.tables WHERE table_schema='public'")[0]?.[0])!==0)throw Error('Existing public tables found without migration history; stop for review');
const applied=ledger?new Map(execute('SELECT name,checksum FROM app_private.migration_history')):new Map();
for(const file of files){
 const sql=readFileSync('cloudbase/migrations/'+file,'utf8'),checksum=createHash('sha256').update(sql).digest('hex');
 if(applied.has(file)){if(applied.get(file)!==checksum)throw Error(`Previously applied migration changed: ${file}`);console.log(`Already applied: ${file}`);continue}
 if(file==='002.sql'){
  // The reference seed exceeds macOS ARG_MAX. Statements are generated one per line.
  const lines=sql.split('\n').filter(line=>line.startsWith('insert into '));let chunk='';
  for(const line of lines){if(Buffer.byteLength(chunk+line)>45000){execute('begin;\n'+chunk+'\ncommit;');chunk=''}chunk+=line+'\n'}if(chunk)execute('begin;\n'+chunk+'\ncommit;');
 }else execute(sql);
 execute(`CREATE TABLE IF NOT EXISTS app_private.migration_history(name text primary key,checksum text not null,applied_at timestamptz not null default now()); REVOKE ALL ON app_private.migration_history FROM public,anon,authenticated; INSERT INTO app_private.migration_history(name,checksum) VALUES(${quote(file)},${quote(checksum)})`);
 console.log(`Applied: ${file}`);
}
console.log('Staging schema applied; hosted user/RLS tests still required.');
