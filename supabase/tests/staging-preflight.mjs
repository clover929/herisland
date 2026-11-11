// GET-only remote preflight. Never applies migrations or creates users.
import nextEnv from '@next/env';
const {loadEnvConfig}=nextEnv;
import {pathToFileURL} from 'node:url';
loadEnvConfig(process.cwd());
export async function verifyStaging(){
 const url=process.env.SUPABASE_TEST_URL,key=process.env.SUPABASE_TEST_PUBLISHABLE_KEY,token=process.env.SUPABASE_ACCESS_TOKEN,expected=process.env.SUPABASE_TEST_EXPECTED_PROJECT_REF;
 const required={SUPABASE_TEST_URL:url,SUPABASE_TEST_PUBLISHABLE_KEY:key,SUPABASE_ACCESS_TOKEN:token,SUPABASE_TEST_EXPECTED_PROJECT_REF:expected};const missing=Object.entries(required).filter(([,v])=>!v?.trim()).map(([k])=>k);
 if(missing.length)throw new Error('Missing configuration names only: '+missing.join(', '));
 const parsed=new URL(url);if(parsed.protocol!=='https:'||parsed.hostname!==`${expected}.supabase.co`||parsed.username||parsed.password||parsed.pathname!=='/')throw new Error('Staging URL does not match the explicitly expected project ref');
 const metadata=await fetch('https://api.supabase.com/v1/projects/'+encodeURIComponent(expected),{headers:{Authorization:'Bearer '+token},signal:AbortSignal.timeout(15000)});if(!metadata.ok)throw new Error('Project identity lookup failed: HTTP '+metadata.status());const project=await metadata.json();if(project.id!==expected||project.name!=='herisland-staging')throw new Error('Remote project identity is not the expected herisland-staging project');
 const settings=await fetch(parsed.origin+'/auth/v1/settings',{headers:{apikey:key},signal:AbortSignal.timeout(15000)});if(!settings.ok)throw new Error('Publishable-key/Auth connection failed: HTTP '+settings.status());const auth=await settings.json();return {projectName:project.name,projectRef:project.id,authReachable:true,emailProviderEnabled:auth.external?.email===true,automaticEmailConfirmation:auth.mailer_autoconfirm===true};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){try{console.log(JSON.stringify(await verifyStaging()))}catch(error){console.error('PREFLIGHT NOT PASSED: '+(error instanceof Error?error.message:'unknown configuration error'));process.exitCode=2}}
