'use client';
import {useEffect} from 'react';
import {usePathname} from 'next/navigation';
export default function LiquidNavigation(){const path=usePathname();useEffect(()=>{
 const header=document.querySelector('header');if(!header)return;header.classList.add('liquid-nav');
 const links=[...header.querySelectorAll<HTMLElement>('nav a')];const spans=links.map(link=>{const span=document.createElement('span');span.className='liquid-nav-label';while(link.firstChild)span.append(link.firstChild);link.append(span);return span});
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let frame=0,last=0,scroll=window.scrollY,impulse=0;const states=links.map(()=>({x:0,y:0,vx:0,vy:0,tx:0,ty:0}));
 const tick=(now:number)=>{const dt=Math.min(.032,(now-last)/1000||.016);last=now;let active=false;states.forEach((s,i)=>{for(const axis of ['x','y'] as const){const v=axis==='x'?'vx':'vy',t=axis==='x'?'tx':'ty';s[v]+=((220*(s[t]-s[axis])-20*s[v])/.7)*dt;s[axis]+=s[v]*dt;if(Math.abs(s[v])+Math.abs(s[t]-s[axis])>.02)active=true;else{s[axis]=s[t];s[v]=0}}spans[i].style.transform=`translate(${s.x}px,${s.y}px)`});impulse*=Math.exp(-dt*12);if(Math.abs(impulse)>.02)active=true;else impulse=0;header.style.setProperty('--nav-lag',`${impulse}px`);frame=active?requestAnimationFrame(tick):0};
 const wake=()=>{if(!frame){last=performance.now();frame=requestAnimationFrame(tick)}};
 const move=(e:PointerEvent)=>{if(e.pointerType!=='mouse'||reduced.matches||!matchMedia('(hover:hover)').matches)return;const box=header.getBoundingClientRect();header.style.setProperty('--nav-x',`${e.clientX-box.left}px`);header.style.setProperty('--nav-y',`${e.clientY-box.top}px`);header.style.setProperty('--nav-glow','1');links.forEach((link,i)=>{const r=link.getBoundingClientRect(),dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2,d=Math.hypot(dx,dy),f=d<100?.3*(1-d/100):0;const x=dx*f,y=dy*f,k=Math.min(1,12/Math.max(1,Math.hypot(x,y)));states[i].tx=x*k;states[i].ty=y*k});wake()};
 const leave=()=>{states.forEach(s=>{s.tx=0;s.ty=0});header.style.setProperty('--nav-glow','0');wake()};
 const onScroll=()=>{const next=window.scrollY;if(!reduced.matches){impulse=Math.max(-5,Math.min(5,(next-scroll)*.06));wake()}scroll=next};
 header.addEventListener('pointermove',move);header.addEventListener('pointerleave',leave);window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('blur',leave);
 return()=>{cancelAnimationFrame(frame);header.removeEventListener('pointermove',move);header.removeEventListener('pointerleave',leave);window.removeEventListener('scroll',onScroll);window.removeEventListener('blur',leave);links.forEach((link,i)=>{while(spans[i].firstChild)link.insertBefore(spans[i].firstChild,spans[i]);spans[i].remove()})};
 },[path]);return null}
