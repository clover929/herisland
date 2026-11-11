'use client';
import {useSyncExternalStore} from 'react';
import type {Message} from './provider';
export type ChatMode='Companion'|'Explore'|'Write';
type Conversation={messages:Message[];text:string;error:string;busy:boolean};
const blank=():Conversation=>({messages:[],text:'',error:'',busy:false});
const initial={mode:'Companion' as ChatMode,conversations:{Companion:blank(),Explore:blank(),Write:blank()}};
let state=initial;let active:AbortController|null=null;const listeners=new Set<()=>void>();
const emit=()=>listeners.forEach(fn=>fn());
function patch(mode:ChatMode,values:Partial<Conversation>){state={...state,conversations:{...state.conversations,[mode]:{...state.conversations[mode],...values}}};emit()}
function subscribe(fn:()=>void){listeners.add(fn);return()=>{listeners.delete(fn)}}
export function useChat(){return useSyncExternalStore(subscribe,()=>state,()=>initial)}
export function changeMode(mode:ChatMode){state={...state,mode};emit()}
export function setChatText(mode:ChatMode,text:string){patch(mode,{text})}
export function clearChat(mode:ChatMode){if(!state.conversations[mode].busy)patch(mode,blank())}
export function cancelChat(){active?.abort()}
export function contextFor(messages:Message[]){let context=messages.slice(-15);while(context.length>1&&context.reduce((n,m)=>n+m.content.length,0)>16000)context=context.slice(2);return context}
export async function sendChat(mode:ChatMode,retry=false){
 if(active)return;const current=state.conversations[mode];if(current.busy)return;
 const text=current.text.trim();if(!retry&&(!text||text.length>4000||current.messages.at(-1)?.role==='user'))return;
 const history:Message[]=retry?current.messages:[...current.messages,{role:'user',content:text}];if(history.at(-1)?.role!=='user')return;
 const control=new AbortController();active=control;let timedOut=false;
 const timer=setTimeout(()=>{timedOut=true;control.abort()},95000);patch(mode,{messages:history,text:retry?current.text:'',busy:true,error:''});
 try{const response=await fetch('/api/ai/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode,messages:contextFor(history)}),signal:control.signal});const data=await response.json();if(!response.ok)throw new Error(data.error?.message||'本地模型暂时无法回复，请重试');if(typeof data.message?.content!=='string'||!data.message.content.trim())throw new Error('回复格式无效，请重试');patch(mode,{messages:[...history,{role:'assistant',content:data.message.content}]})}catch(e){patch(mode,{error:control.signal.aborted?(timedOut?'等待本地模型超时，请检查模型后重新发送':'已取消生成，可重新发送'):e instanceof Error?e.message:'请求失败，请重试'})}finally{clearTimeout(timer);active=null;patch(mode,{busy:false})}
}
