'use client';
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {browserCloudbase} from '@/lib/cloudbase/browser';
import {safeNext} from '@/lib/supabase/config';
type Verify=(params:{token:string})=>Promise<{error?:unknown}>;
type Reset=(params:{nonce:string;password:string})=>Promise<{error?:unknown}>;
export default function CloudbaseAuthPanel({mode}:{mode:'login'|'register'|'reset'}){
 const router=useRouter(),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[step,setStep]=useState(false),[hydrated,setHydrated]=useState(false),[registrationEnabled,setRegistrationEnabled]=useState(false),verify=useRef<Verify|undefined>(undefined),reset=useRef<Reset|undefined>(undefined),password=useRef('');
 useEffect(()=>{const timer=setTimeout(()=>setHydrated(true),0);return()=>clearTimeout(timer)},[]);
 useEffect(()=>{if(mode!=='register')return;let active=true;void fetch('/api/cloudbase/config',{cache:'no-store'}).then(r=>r.json()).then(c=>{if(active)setRegistrationEnabled(c.registrationEnabled===true)}).catch(()=>{});return()=>{active=false}},[mode]);
 if(mode==='register'&&!registrationEnabled)return <section className="narrow auth detail"><h1>HerIsland 邀请测试</h1><p>真实账户和云端保存正在验收，暂未开放公众注册。域名备案、运营主体与注册邮件流程确认后再开放。</p><Link href="/login">已有受邀账户，前往登录</Link></section>;
 return <section className="narrow auth detail"><h1>{{login:'欢迎回到 HerIsland',register:'加入 HerIsland',reset:'找回密码'}[mode]}</h1><p>使用腾讯云 CloudBase 认证。请使用自己的邮箱，验证后才能建立账户。</p><form method="post" action="/api/cloudbase/form-fallback" onSubmit={async e=>{e.preventDefault();if(busy)return;const form=new FormData(e.currentTarget);setBusy(true);setMessage('');try{
  const auth=(await browserCloudbase()).auth;
  if(step&&mode==='register'){const result=await verify.current?.({token:String(form.get('code'))});if(!result||result.error)throw Error('验证码不正确或已过期');password.current='';setMessage('邮箱验证成功，请登录');setStep(false);router.replace('/login');return}
  if(step&&mode==='reset'){const result=await reset.current?.({nonce:String(form.get('code')),password:String(form.get('password'))});if(!result||result.error)throw Error('重置失败，请重新获取验证码');setMessage('密码已更新，请登录');setStep(false);return}
  if(mode==='login'){const identifier=String(form.get('email')).trim();const result=await auth.signInWithPassword({...identifier.includes('@')?{email:identifier}:{username:identifier},password:String(form.get('password'))});if(result.error||!result.data.user)throw Error('登录失败，请检查邮箱、密码和验证状态');window.dispatchEvent(new Event('herisland:auth-change'));router.replace(safeNext(new URLSearchParams(location.search).get('next')));router.refresh()}
  if(mode==='register'){if(form.get('consent')!=='on')throw Error('请先阅读条款并确认成年');password.current=String(form.get('password'));const result=await auth.signUp({email:String(form.get('email')),password:password.current,name:String(form.get('displayName'))});password.current='';if(result.error||!result.data.verifyOtp)throw Error('暂时无法注册，请稍后重试');verify.current=result.data.verifyOtp;setStep(true);setMessage('验证码已请求，请查收邮箱（含垃圾邮件）')}
  if(mode==='reset'){const result=await auth.resetPasswordForEmail(String(form.get('email')));if(result.error||!result.data.updateUser)throw Error('暂时无法重置密码');reset.current=result.data.updateUser;setStep(true);setMessage('如果邮箱已注册，将收到重置验证码')}
 }catch(error){setMessage(error instanceof Error?error.message:'认证服务暂不可用')}finally{setBusy(false)}}}>
 {!step&&<label>{mode==='login'?'邮箱或用户名':'邮箱'}<input name="email" type={mode==='login'?'text':'email'} autoComplete={mode==='login'?'username':'email'} required maxLength={254}/></label>}
 {!step&&mode==='register'&&<label>昵称<input name="displayName" required maxLength={80} autoComplete="nickname"/></label>}
 {((!step&&mode!=='reset')||(step&&mode==='reset'))&&<label>密码<input name="password" type="password" required minLength={mode==='login'?1:12} maxLength={32} autoComplete={mode==='login'?'current-password':'new-password'}/></label>}
 {step&&<label>邮箱验证码<input name="code" required maxLength={12} autoComplete="one-time-code" inputMode="numeric"/></label>}
 {!step&&mode==='register'&&<label><input type="checkbox" name="consent" required/>我已满18岁，已阅读<Link href="/terms">社区规则</Link>和<Link href="/privacy">隐私说明</Link>。</label>}
 <button className="primary" disabled={busy||!hydrated}>{busy?'处理中…':step?'验证并完成':mode==='login'?'登录':mode==='register'?'发送注册验证码':'发送重置验证码'}</button></form><p role="status">{message}</p><p><Link href="/login">登录</Link> · <Link href="/register">注册</Link> · <Link href="/auth/reset?request=1">找回密码</Link></p></section>;
}
