'use client';
import SunArt from './sun-art';
import Link from 'next/link';
import {useEffect,useState} from 'react';
export const sunQuotes=['今天也可以从一件小事开始。','好奇心是很棒的指南针。','不必急着成为谁，先认真认识自己。','走，去看看今天岛上发生了什么！','你不需要对每个问题都有标准答案。','今天想认识哪位了不起的女性？'];
const random=(n:number)=>crypto.getRandomValues(new Uint32Array(1))[0]%n;
export default function SunnySun(){const [quote,setQuote]=useState<number|null>(null),[closed,setClosed]=useState(false);
 useEffect(()=>{let dismissed=false;try{dismissed=sessionStorage.getItem('herisland-sun-dismissed')==='1'}catch{}const init=setTimeout(()=>{setClosed(dismissed);if(!dismissed)setQuote(random(sunQuotes.length))},0);const tick=setInterval(()=>{if(!document.hidden&&!dismissed)setQuote(q=>q===null?random(6):(q+1+random(5))%6)},25000);return()=>{clearTimeout(init);clearInterval(tick)}},[]);
 function dismiss(){setClosed(true);try{sessionStorage.setItem('herisland-sun-dismissed','1')}catch{}}
 return <aside className="hi-sun-guide" aria-label="小晴太阳"><Link href="/ai" className="hi-sun-link" aria-label="小晴太阳，进入Sunny AI"><SunArt/><span>小晴 Sunny ↗</span></Link>{quote!==null&&!closed&&<div className="hi-sun-bubble"><p>{sunQuotes[quote]}</p><button onClick={dismiss} aria-label="关闭小晴气泡">×</button></div>}</aside>
}
