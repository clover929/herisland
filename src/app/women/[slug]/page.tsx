import {womenReturn} from '@/features/women/return-link';
import CommunityApp from '@/components/community-app';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {publishedWomen} from '@/features/women/catalog';
import {relatedWomen} from '@/features/women/schema';
import {WomenCards} from '@/components/women-cards';
import {WomanPortrait} from '@/components/woman-portrait';
export default async function Page({params,searchParams}:{params:Promise<{slug:string}>;searchParams?:Promise<Record<string,string|string[]|undefined>>}){
 const {slug}=await params;const returnTo=womenReturn((await searchParams)?.returnTo);const w=publishedWomen.find(w=>w.slug===slug);if(!w)notFound();
 const sourceNumber=(url:string)=>w.sources.findIndex(s=>s.url===url)+1;
 return <CommunityApp path="/women"><article className="narrow detail woman-detail">
 <Link href={returnTo}>← 人物资料库</Link><WomanPortrait src={w.image.url} name={w.nameZh}/>
 <p className="woman-status">已审核发布 · 核实于 {w.lastVerifiedAt}</p><h1>{w.nameZh}</h1>
 <p>{w.nameEn} · {w.fields.join(' / ')} · {w.regions.join(' / ')}</p><p>{w.occupation}</p><p>{w.summary}</p>
 <h2>代表成就与核实事实</h2><ul>{w.facts.map(f=><li key={f.claim}>{f.claim} {f.sourceUrls.map(url=><a key={url} className="source-link" href={`#source-${sourceNumber(url)}`} aria-label={`查看来源${sourceNumber(url)}`}>[{sourceNumber(url)}]</a>)}</li>)}</ul>
 <h2>她的故事</h2>{w.story.split('\n').filter(Boolean).map(p=><p className="bodytext" key={p}>{p}</p>)}
 {w.timeline.length>0&&<><h2>重要时间线</h2><ol className="woman-timeline">{w.timeline.map((e,i)=><li key={`${e.year}-${i}`}><b>{e.year}</b><p>{e.description} {e.sourceUrls.map(url=><a className="source-link" key={url} href={`#source-${sourceNumber(url)}`}>[{sourceNumber(url)}]</a>)}</p></li>)}</ol></>}
 {w.editorialNotes.length>0&&<aside className="woman-editorial"><h2>编辑说明与资料边界</h2>{w.editorialNotes.map(n=><p key={n}>{n}</p>)}</aside>}
 <h2>资料来源</h2><ol className="woman-sources">{w.sources.map((s,i)=><li id={`source-${i+1}`} key={s.url}><a href={s.url} rel="noreferrer">{s.title} ↗</a><small>核对日期 {s.checkedAt}</small></li>)}</ol>
 <p>图片：{w.image.credit} · {w.image.url==='/women-placeholder.svg'?'原创设计占位图，无真人肖像':w.image.license}</p>
 <p>作者：{w.image.author} · {w.image.attributionRequired?'须保留署名':'无额外署名要求'} · <a href={w.image.sourceUrl}>图片出处</a></p>
 <p>内容审核：{w.reviewedAt} · 更新于 {w.updatedAt}</p>
 </article><section aria-label="相关推荐"><h2>继续认识她们</h2><WomenCards women={relatedWomen(publishedWomen,w)} returnTo={returnTo}/></section></CommunityApp>
}
