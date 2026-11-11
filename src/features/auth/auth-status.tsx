'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {useRouter} from 'next/navigation';
import {supabaseMode} from '@/lib/supabase/config';
import {browserSupabase} from '@/lib/supabase/browser';
export default function AuthStatus(){
 const [signed,setSigned]=useState(false),[error,setError]=useState(''),router=useRouter();
 useEffect(()=>{
  if(!supabaseMode())return;
  let active=true;
  const load=()=>void fetch('/api/auth/session',{cache:'no-store'}).then(r=>r.json()).then(d=>{if(active)setSigned(!!d.user)}).catch(()=>{});
  load();let stop=()=>{};
  try{const {data}=browserSupabase().auth.onAuthStateChange(()=>load());stop=()=>data.subscription.unsubscribe()}catch{}
  window.addEventListener('herisland:auth-change',load);
  return()=>{active=false;stop();window.removeEventListener('herisland:auth-change',load)};
 },[]);
 async function logout(){try{const response=await fetch('/api/auth/logout',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});if(!response.ok){setError('退出未完成，请重试');return}setSigned(false);setError('');router.replace('/login');router.refresh()}catch{setError('网络不可用，退出未完成')}}
 return signed?<><button onClick={()=>void logout()}>退出登录</button>{error&&<span role="status">{error}</span>}</>:<Link className="loginlink" href="/login">登录 / 注册</Link>;
}
