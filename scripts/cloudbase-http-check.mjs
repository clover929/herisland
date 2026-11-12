import fs from 'node:fs';
import path from 'node:path';
const origin=process.env.HERISLAND_TEST_ORIGIN||'https://herisland-346174-9-1530109559.sh.run.tcloudbase.com',files=[];
function walk(folder){for(const entry of fs.readdirSync(folder,{withFileTypes:true})){const file=path.join(folder,entry.name);if(entry.isDirectory())walk(file);else files.push('/'+file.replace(/^public\//,''))}}walk('public');
const failed=[];let index=0;
await Promise.all(Array.from({length:3},async()=>{while(index<files.length){const file=files[index++];try{const response=await fetch(origin+file,{method:'HEAD',signal:AbortSignal.timeout(20000)});if(response.status!==200)failed.push({file,status:response.status})}catch{failed.push({file,error:'network'})}}}));
const result={origin,staticFiles:files.length,failed,scope:'HTTP static-resource checks, not independent mainland ISP probes'};
fs.writeFileSync('artifacts/release/cloudbase-http-result.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));if(failed.length)process.exitCode=1;
