'use client';
import {useEffect,type HTMLAttributes} from 'react';
import {usePathname} from 'next/navigation';
let origin:DOMRect|null=null;
export function startSunnyFlight(element:HTMLElement){origin=element.getBoundingClientRect()}
export function AuroraBackground(){return <div className="aurora-background" aria-hidden="true"><i/><i/><i/><div className="aurora-ocean"><svg viewBox="0 0 1440 600" preserveAspectRatio="none"><path d="M-300 250Q0 80 300 250T900 250T1500 250T2100 250V700H-300Z"/><path d="M-300 350Q0 170 300 350T900 350T1500 350T2100 350V700H-300Z"/></svg></div></div>}
/** Enhances existing cards without remounting forms or chat state. */
export function AuroraGlassCard({className,children,...props}:HTMLAttributes<HTMLDivElement>){return <div {...props} className={`aurora-glass-card ${className??''}`}>{children}</div>}
export function PageReveal(){
 const path=usePathname();
 useEffect(()=>{
  const main=document.querySelector('main');if(!main)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveal=reduced?null:main.animate([{filter:'blur(20px)',opacity:0},{filter:'blur(0px)',opacity:1}],{duration:800,easing:'cubic-bezier(.16,1,.3,1)'});
  const enabled=['/discussions','/communities','/profile','/ai','/login','/register'].some(p=>path===p||path.startsWith(p+'/'));
  document.body.classList.toggle('aurora-active',enabled);
  document.body.classList.toggle('aurora-auth',path==='/login'||path==='/register');
  const cards=enabled?[...main.querySelectorAll<HTMLElement>('.post,.detail,.sidebox,.sunny-panel')]:[];
  cards.forEach(e=>e.classList.add('aurora-glass-card'));
  const move=(event:PointerEvent)=>{if(reduced||event.pointerType!=='mouse'||!matchMedia('(hover:hover)').matches)return;const target=event.target as HTMLElement;const card=target.closest<HTMLElement>('.aurora-glass-card');if(!card)return;if(card.matches('.auth:focus-within')||target.closest('input,textarea,select,button,a')){card.style.setProperty('--ax','0deg');card.style.setProperty('--ay','0deg');return;}if(!card.matches('.auth')&&card.querySelector('input,textarea,select'))return;const r=card.getBoundingClientRect();card.style.setProperty('--ax',`${(0.5-(event.clientY-r.top)/r.height)*20}deg`);card.style.setProperty('--ay',`${((event.clientX-r.left)/r.width-0.5)*20}deg`)};
  const reset=(event:PointerEvent)=>{const card=(event.target as HTMLElement).closest<HTMLElement>('.aurora-glass-card');if(card&&!card.contains(event.relatedTarget as Node|null)){card.style.setProperty('--ax','0deg');card.style.setProperty('--ay','0deg')}};
  main.addEventListener('pointermove',move);main.addEventListener('pointerout',reset);
  let flight:Animation|null=null;let clone:HTMLElement|null=null;
  const target=document.querySelector<HTMLElement>('.sunny-destination');
  if(path==='/ai'&&origin&&target&&!reduced){const from=origin;origin=null;const to=target.getBoundingClientRect();clone=target.cloneNode(true) as HTMLElement;clone.className='sunny-flight';clone.style.cssText=`position:fixed;left:${to.x}px;top:${to.y}px;width:${to.width}px;height:${to.height}px;z-index:9999;pointer-events:none`;document.body.append(clone);target.style.visibility='hidden';const dx=from.x-to.x,dy=from.y-to.y;flight=clone.animate([{transform:`translate(${dx}px,${dy}px)`,opacity:1},{transform:`translate(${dx*.4-80}px,${dy*.5-100}px)`,opacity:.35,offset:.5},{transform:'translate(0,0)',opacity:1}],{duration:1000,easing:'cubic-bezier(.4,0,.2,1)'});flight.onfinish=()=>{clone?.remove();target.style.visibility=''}}else{origin=null}
  return()=>{reveal?.cancel();flight?.cancel();clone?.remove();if(target)target.style.visibility='';main.removeEventListener('pointermove',move);main.removeEventListener('pointerout',reset);cards.forEach(e=>e.classList.remove('aurora-glass-card'))};
 },[path]);
 return <><AuroraBackground/></>;
}
