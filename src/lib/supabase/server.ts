import 'server-only';
import {createServerClient} from '@supabase/ssr';
import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {safeNext,supabaseConfig,supabaseMode} from './config';
export async function serverSupabase(){
 const store=await cookies(),{url,key}=supabaseConfig();
 return createServerClient(url,key,{cookies:{
  getAll:()=>store.getAll(),
  setAll(values){try{values.forEach(({name,value,options})=>store.set(name,value,options))}catch{/* Proxy handles refresh cookie writes before Server Components render. */}}
 }});
}
export async function requireUser(next='/profile'){if(!supabaseMode())return null;const client=await serverSupabase();const {data,error}=await client.auth.getUser();if(error||!data.user)redirect('/login?next='+encodeURIComponent(safeNext(next)));return data.user}
