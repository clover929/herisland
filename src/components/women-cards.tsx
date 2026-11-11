import {SpotlightCard} from "./motion/interaction-primitives";
import Link from 'next/link';
import type {Woman} from '@/features/women/schema';
import {statusLabels} from '@/features/women/schema';
import {WomanPortrait} from './woman-portrait';
export function WomenCards({women,returnTo}:{women:Woman[];returnTo?:string}){return <div className="women-grid">{women.map(w=><SpotlightCard className="detail woman-card" key={w.id}>
 <WomanPortrait src={w.image.url} name={w.nameZh}/><p className="woman-status">{statusLabels[w.status]}</p>
 <h2>{w.status==='published'?<Link href={`/women/${w.slug}${returnTo?`?returnTo=${encodeURIComponent(returnTo)}`:""}`}>{w.nameZh}</Link>:w.nameZh}</h2><p lang="en">{w.nameEn}</p>
 {w.status==='published'?<p>{w.summary}</p>:<p>资料已完成事实核实，人物故事待内容审核后开放。</p>}
 <small>{w.fields.join(' · ')} / {w.regions.join(' / ')}</small>
 {w.status==='published'&&<p><Link href={`/women/${w.slug}${returnTo?`?returnTo=${encodeURIComponent(returnTo)}`:""}`}>阅读人物资料 →</Link></p>}
 </SpotlightCard>)}</div>}
export function FeaturedWomen({women}:{women:Woman[]}){return <section aria-label="精选真实女性人物"><div className="sectionhead"><h2>她们的故事 · 真实人物资料库</h2><Link href="/women">浏览人物资料库 →</Link></div>{women.length?<WomenCards women={women.filter(w=>w.status==='published'&&w.featured).slice(0,10)}/>:<p>精选人物将在审核发布后展示。</p>}</section>}
