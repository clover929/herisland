'use client';
import {useEffect,useRef,useState,useId} from 'react';
import type {FooterConfig,SocialKind} from './lakeside-config';
import './lakeside-footer.css';
function SocialIcon({kind}:{kind:SocialKind}){
 const paths:Record<SocialKind,React.ReactNode>={
 instagram:<><rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.8" r=".8" fill="currentColor" stroke="none"/></>,
 linkedin:<><rect x="3.5" y="3.5" width="17" height="17" rx="2"/><path d="M7.7 10.4v6.5M7.7 7.3v.1M11.3 16.9v-6.5m0 2.2c0-3.1 5-3.1 5 0v4.3"/></>,
 pinterest:<><path d="M8.5 21c1.5-3.4 2.2-7.6 3-11m-.8 4.5c1.6 2.5 6.1 1.8 7.1-2.6 1.1-5-2.1-8.4-6.8-7.6-5.7 1-6.5 7.6-3.7 9.5"/><path d="M11.5 10c.8-2.8 3.6-2.3 2.6.8l-1 3"/></>,
 mail:<><rect x="3.5" y="5.5" width="17" height="13" rx="1.5"/><path d="m4.5 7 7.5 6L19.5 7"/></>
 };
 return <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[kind]}</svg>;
}
function Link({href,children,...props}:React.AnchorHTMLAttributes<HTMLAnchorElement>){const external=/^https?:\/\//.test(href||'');return <a href={href} {...props} {...(external?{target:'_blank',rel:'noopener noreferrer'}:{})}>{children}</a>}
export function LakesideFooter({config,className='',illustrated=false}:{config:FooterConfig;className?:string;illustrated?:boolean}){
 const id=useId();const ref=useRef<HTMLElement>(null);const [inView,setInView]=useState(false);
 useEffect(()=>{const element=ref.current;if(!element)return;if(!('IntersectionObserver' in window)){element.dataset.inView='true';return}const observer=new IntersectionObserver(([entry])=>setInView(!!entry?.isIntersecting),{rootMargin:'40px'});observer.observe(element);return ()=>observer.disconnect()},[]);
 return <footer ref={ref} className={`lakeside-footer ${className}`} aria-label={`${config.brand.name} 页脚`} data-in-view={inView}>
  <div className="lf-content">
   <div className="lf-grid">
    <div className="lf-brand"><Link href={config.brand.homeHref} className="lf-wordmark"><svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M4 21q6-5 12 0t12 0M4 26q6-5 12 0t12 0M16 4v14m-2-12L6 17h8m5-8 6 8h-6" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round"/></svg>{config.brand.name}<span>®</span></Link><p className="lf-introduction">{config.brand.tagline}</p><ul className="lf-socials" aria-label="Social links">{config.socials.map(s=><li key={s.kind}><Link href={s.href} aria-label={s.label}><SocialIcon kind={s.kind}/></Link></li>)}</ul></div>
    {config.navigation.map((group,i)=><nav className="lf-nav" key={group.title} aria-labelledby={`${id}-heading-${i}`}><h2 id={`${id}-heading-${i}`}>{group.title}</h2><ul>{group.links.map(link=><li key={link.href}><Link href={link.href}>{link.label}</Link></li>)}</ul></nav>)}
   </div>
   <div className="lf-legal"><small>{config.copyright}</small><small>{config.credit.prefix} <Link href={config.credit.href}>{config.credit.label}<span aria-hidden="true"> ↗</span></Link></small></div>
  </div>
  {illustrated&&<div className="lf-artwork" aria-hidden="true"><picture className="lf-static"><source media="(max-width: 640px)" srcSet={config.illustration.mobile}/><img src={config.illustration.desktop} alt="" width="1400" height="480"/></picture><picture className="lf-water"><source media="(max-width: 640px)" srcSet={config.illustration.waterMobile}/><img src={config.illustration.waterDesktop} alt="" width="1400" height="480"/></picture></div>}
 </footer>;
}
