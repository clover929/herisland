import CommunityApp from '@/components/community-app';
import Link from 'next/link';
import {womenDirectory} from '@/features/women/catalog';
import {browseWomen} from '@/features/women/schema';
import {WomenCards} from '@/components/women-cards';
export default async function Page({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
 const params=await searchParams;const get=(k:string)=>typeof params[k]==='string'?params[k] as string:'';
 const q=get('q'),field=get('field'),region=get('region');const result=browseWomen(womenDirectory,q,field,region,Number(get('page')||1));
 const href=(page:number)=>`/women?${new URLSearchParams({q,field,region,page:String(page)})}`;
 return <CommunityApp path="/women"><section><Link href="/">← HerSpace 首页</Link><h1>她们的故事</h1><p>真实女性人物资料库 · 目录收录已核实人物，故事完成内容审核后开放</p><form className="women-filters"><label>姓名或关键词<input name="q" defaultValue={q} placeholder="姓名、领域、国家或地区、关键词"/></label><label>领域<select aria-label="领域" name="field" defaultValue={field}><option value="">全部领域</option>{[...new Set(womenDirectory.flatMap(w=>w.fields)),...(field?[field]:[])].filter((v,i,a)=>a.indexOf(v)===i).map(v=><option key={v}>{v}</option>)}</select></label><label>国家或地区<select aria-label="国家或地区" name="region" defaultValue={region}><option value="">全部国家或地区</option>{[...new Set(womenDirectory.flatMap(w=>w.regions)),...(region?[region]:[])].filter((v,i,a)=>a.indexOf(v)===i).map(v=><option key={v}>{v}</option>)}</select></label><button type="submit">搜索筛选</button><Link href="/women">重置</Link></form><p role="status">共 {result.total} 位人物</p>{result.total?<WomenCards women={result.items} returnTo={q||field||region||result.page>1?href(result.page):undefined}/>:<div className="empty"><h2>{womenDirectory.length?'没有匹配的人物':'人物资料正在核实中'}</h2><p>候选人物不会自动公开。请调整搜索条件或重置筛选。</p></div>}<nav className="women-pagination" aria-label="人物分页">{result.page>1&&<Link href={href(result.page-1)}>上一页</Link>}<span>第 {result.page} / {result.pages} 页</span>{result.page<result.pages&&<Link href={href(result.page+1)}>下一页</Link>}</nav></section></CommunityApp>
}
