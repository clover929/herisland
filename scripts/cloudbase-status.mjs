import {execFileSync} from 'node:child_process';
const env='herisland-staging-d8dnse0ea80165',service='herisland';
function run(args){const output=execFileSync('npm',['exec','--yes','--package=@cloudbase/cli','--','tcb',...args,'--json'],{encoding:'utf8',maxBuffer:8*1024*1024});const start=output.indexOf('{');return JSON.parse(output.slice(start)).data}
const detail=run(['cloudrun','detail','-e',env,'-s',service]);
console.log(JSON.stringify({service:detail.BaseInfo,online:detail.OnlineVersionInfos,limits:{min:detail.ServerConfig?.MinNum,max:detail.ServerConfig?.MaxNum,cpu:detail.ServerConfig?.Cpu,memory:detail.ServerConfig?.Mem},environmentKeys:Object.keys(JSON.parse(detail.ServerConfig?.EnvParams||'{}'))}));
const records=run(['cloudrun','record','list','-e',env,'-s',service]);console.log(JSON.stringify({records:records.DeployRecords?.slice(0,3)}));
if(process.argv.includes('--logs')){const latest=records.DeployRecords?.[0];if(latest?.RunId)console.log(JSON.stringify(run(['cloudrun','logs','process','-e',env,'--run-id',latest.RunId])));const build=run(['cloudrun','logs','build','-e',env,'-s',service]);console.log(JSON.stringify({buildFailure:build.Log?.FailReason,buildTail:build.Log?.Text?.split('\n').filter(s=>!s.includes('inflating:')&&!s.includes(': Waiting')).slice(-35)}))}
