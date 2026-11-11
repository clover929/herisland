'use client';
import {useEffect,useRef} from 'react';

/** Conservative open-water sample. Original art is sampled at identical coordinates;
 * only the feathered water patch is displaced, never the underlying island. */
export default function LivingWater(){
 const ref=useRef<SVGSVGElement>(null);
 useEffect(()=>{const svg=ref.current;if(!svg)return;const reduced=matchMedia('(prefers-reduced-motion: reduce)');let visible=false;const update=()=>{if(!visible||document.hidden||reduced.matches)svg.pauseAnimations();else svg.unpauseAnimations()};const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;update()});observer.observe(svg);reduced.addEventListener('change',update);document.addEventListener('visibilitychange',update);return()=>{observer.disconnect();reduced.removeEventListener('change',update);document.removeEventListener('visibilitychange',update)}},[]);

 return <svg ref={ref} className="hi-living-water" viewBox="0 0 1400 880" preserveAspectRatio="none" aria-hidden="true" data-water-scope="northeast-open-water-sample">
  <defs>
   <filter id="hi-water-uv" x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency=".024 .045" numOctaves="2" seed="17" result="field"/>
    <feOffset in="field" result="flow"><animate attributeName="dx" values="-4;4;-4" dur="12s" repeatCount="indefinite"/><animate attributeName="dy" values="2;-2;2" dur="18s" repeatCount="indefinite"/></feOffset>
    <feDisplacementMap in="SourceGraphic" in2="flow" scale="2.5" xChannelSelector="R" yChannelSelector="G"><animate attributeName="scale" values="2;5;2" dur="9s" repeatCount="indefinite"/></feDisplacementMap>
   </filter>
   <filter id="hi-water-feather"><feGaussianBlur stdDeviation="5"/></filter>
   <mask id="hi-safe-water" maskUnits="userSpaceOnUse"><path d="M1080 12H1387V150L1340 162L1250 150L1160 125L1080 95Z" fill="white" filter="url(#hi-water-feather)"/></mask>
  </defs>
  <g mask="url(#hi-safe-water)"><image href="/island/editorial-v1.png" width="1400" height="880" preserveAspectRatio="none" filter="url(#hi-water-uv)"/></g>
 </svg>
}
