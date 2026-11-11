'use client';
import Image from 'next/image';
import {useState} from 'react';
export function WomanPortrait({src,name}:{src?:string;name:string}){
 const [failed,setFailed]=useState(false);
 if(!src||src==='/women-placeholder.svg'||failed)return <div className="woman-placeholder" role="img" aria-label={`${name} · 肖像占位图`}><span aria-hidden="true">她</span><small>以故事认识她</small></div>;
 return <Image className="woman-photo" src={src} alt={`${name}肖像`} width={480} height={320} unoptimized loading="lazy" onError={()=>setFailed(true)}/>;
}
