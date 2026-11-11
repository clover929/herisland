'use client';
import {useEffect,useRef,useState} from 'react';
import {categories} from '../data';
export function useListFilters(path:string){
 const [query,setQuery]=useState(''),[category,setCategory]=useState('全部');const current=useRef({query:'',category:'全部'});
 useEffect(()=>{function restore(){const params=new URLSearchParams(location.search);let saved:{q?:string;category?:string}={};try{const parsed:unknown=JSON.parse(sessionStorage.getItem('herspace-filters:'+path)||'{}');if(parsed&&typeof parsed==='object')saved=parsed as typeof saved}catch{}const q=params.get('q')??saved.q??'',c=params.get('category')??saved.category??'全部';current.current={query:typeof q==='string'?q.slice(0,200):'',category:['全部',...categories].includes(c)?c:'全部'};setQuery(current.current.query);setCategory(current.current.category)}const timer=setTimeout(restore,0);window.addEventListener('popstate',restore);return()=>{clearTimeout(timer);window.removeEventListener('popstate',restore)}},[path]);
 function persist(q:string,c:string){const params=new URLSearchParams(location.search);if(q)params.set('q',q);else params.delete('q');if(c!=='全部')params.set('category',c);else params.delete('category');const url=location.pathname+(params.size?'?'+params:'')+location.hash;window.history.replaceState(window.history.state,'',url);try{sessionStorage.setItem('herspace-filters:'+path,JSON.stringify({q,category:c}))}catch{}}
 return {query,category,changeQuery(q:string){q=q.slice(0,200);current.current.query=q;setQuery(q);persist(q,current.current.category)},changeCategory(c:string){current.current.category=c;setCategory(c);persist(current.current.query,c)}};
}
