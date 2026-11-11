'use client';
import {useEffect,useRef,useState} from 'react';
import {initial,parseState} from './store';
import type {State} from '../types';
export function useDemoState(){
 const [state,setState]=useState<State>(initial),[ready,setReady]=useState(false),[error,setError]=useState('');
 const canWrite=useRef(false),snapshot=useRef<string|null>(null);
 useEffect(()=>{function load(){try{const raw=localStorage.getItem('herspace-demo');const next=parseState(raw);snapshot.current=raw;setState(next);canWrite.current=true;setError('')}catch{canWrite.current=false;setError('本地演示数据读取失败，已暂停写入以保护原数据。请先备份并检查浏览器存储，再刷新重试。')}setReady(true)}const timer=setTimeout(load,0);function change(e:StorageEvent){if(e.key==='herspace-demo'||e.key===null)load()}window.addEventListener('storage',change);return()=>{clearTimeout(timer);window.removeEventListener('storage',change)}},[]);
 function update(next:State):boolean{if(!canWrite.current){setError('本地数据尚未安全载入，未保存操作；你的输入仍保留。');return false}try{const raw=localStorage.getItem('herspace-demo');if(raw!==snapshot.current){setState(parseState(raw));snapshot.current=raw;setError('其他页面更新了本地演示数据，已重新载入。请再试一次操作。');return false}const encoded=JSON.stringify(next);localStorage.setItem('herspace-demo',encoded);snapshot.current=encoded;setState(next);setError('');return true}catch{canWrite.current=false;setError('保存失败，原有存储及表单输入未被清除。请检查浏览器存储后刷新。');return false}}
 return {state,ready,error,update};
}
