export type Status = 'candidate' | 'researching' | 'verified' | 'published';
export interface Woman { id:string; slug:string; occupation:string; facts:{claim:string;sourceUrls:string[]}[]; nameZh:string; nameEn:string; fields:string[]; regions:string[]; keywords:string[]; summary:string; achievements:string[]; story:string; sources:{title:string;url:string;checkedAt:string}[]; image:{url:string;license:string;credit:string;sourceUrl:string;author:string;attributionRequired:boolean}; status:Status; updatedAt:string; lastVerifiedAt:string|null; reviewedAt:string|null; editorialNotes:string[]; timeline:{year:number;description:string;sourceUrls:string[]}[]; featured:boolean }
const object=(x:unknown):x is Record<string,unknown>=>typeof x==='object'&&x!==null&&!Array.isArray(x);
const strings=(x:unknown):x is string[]=>Array.isArray(x)&&x.every(v=>typeof v==='string'&&v.trim().length>0);
const date=(x:unknown)=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&!Number.isNaN(Date.parse(x))&&new Date(x).toISOString().slice(0,10)===x;
const https=(x:unknown)=>{try{return typeof x==='string'&&new URL(x).protocol==='https:'}catch{return false}};
export function parseWomen(input:unknown):Woman[]{
 if(!Array.isArray(input)) throw new Error('人物目录必须为数组');
 // Workers freeze the clock during module evaluation; use the build year there.
 const currentYear=Number(process.env.HERISLAND_REFERENCE_YEAR)||new Date().getUTCFullYear();
 const ids=new Set(),slugs=new Set();
 for(const x of input){
 if(!object(x)||!['id','slug','nameZh','nameEn'].every(k=>typeof x[k]==='string'&&String(x[k]).trim())||!/^([a-z0-9]+-)*[a-z0-9]+$/.test(String(x.slug))||!['fields','regions','keywords','achievements'].every(k=>strings(x[k]))||!['summary','story'].every(k=>typeof x[k]==='string')||!['candidate','researching','verified','published'].includes(String(x.status))||!date(x.updatedAt)||typeof x.featured!=='boolean'||!Array.isArray(x.sources)||!x.sources.every(s=>object(s)&&typeof s.title==='string'&&s.title.trim()&&https(s.url)&&date(s.checkedAt))||!object(x.image)||!['url','license','credit'].every(k=>typeof (x.image as Record<string,unknown>)[k]==='string') ) throw new Error('人物记录不符合 schema');
 if(typeof x.occupation!=='string'||!Array.isArray(x.facts)||!x.facts.every(f=>object(f)&&typeof f.claim==='string'&&f.claim.trim()&&strings(f.sourceUrls)&&f.sourceUrls.length>0&&f.sourceUrls.every(url=>(x.sources as {url:string}[]).some(s=>s.url===url)))) throw new Error('事实必须关联已记录来源');
 if(!strings(x.editorialNotes)||!Array.isArray(x.timeline)||!x.timeline.every(e=>object(e)&&Number.isInteger(e.year)&&Number(e.year)>0&&Number(e.year)<=currentYear&&typeof e.description==='string'&&e.description.trim()&&strings(e.sourceUrls)&&e.sourceUrls.length>0&&e.sourceUrls.every(url=>(x.sources as {url:string}[]).some(s=>s.url===url)))) throw new Error('时间线必须关联来源且年份有效');
 if(x.lastVerifiedAt!==null&&!date(x.lastVerifiedAt)||x.reviewedAt!==null&&!date(x.reviewedAt)) throw new Error('核实及审核日期无效');
 if(['verified','published'].includes(String(x.status))&&(!date(x.lastVerifiedAt)||(x.sources as {checkedAt:string}[]).some(s=>s.checkedAt>String(x.lastVerifiedAt)))) throw new Error('已核实资料需要核实日期');
 if(x.status==='published'&&(!date(x.reviewedAt)||String(x.reviewedAt)<String(x.lastVerifiedAt))) throw new Error('发布前需要完成内容审核');
 if(x.featured&&x.status!=='published') throw new Error('仅已审核发布人物可精选');
 if(typeof x.image.sourceUrl!=='string'||typeof x.image.author!=='string'||!x.image.author.trim()||typeof x.image.attributionRequired!=='boolean'||(x.image.sourceUrl!=='/women-placeholder.svg'&&!https(x.image.sourceUrl))) throw new Error('图片需要出处、作者及署名要求');
 if(['verified','published'].includes(String(x.status))&&(!x.occupation.trim()||x.facts.length<2||String(x.summary).length<100||String(x.summary).length>150||String(x.story).replace(/\s/g,'').length<300||String(x.story).replace(/\s/g,'').length>500)) throw new Error('已核实记录需要职业、两项事实及完整简介故事');
 if(ids.has(x.id)||slugs.has(x.slug)) throw new Error('人物 id 或 slug 重复');
 ids.add(x.id);slugs.add(x.slug);
 if(x.image.url!=='/women-placeholder.svg'&&(!https(x.image.url)||!String(x.image.license).trim()||x.image.license==='unknown'||!String(x.image.credit).trim())) throw new Error('图片需要明确许可');
 if(['verified','published'].includes(String(x.status))&&(!(x.sources as unknown[]).length||!String(x.summary).trim()||!String(x.story).trim()||!(x.fields as string[]).length||!(x.regions as string[]).length||!(x.achievements as string[]).length)) throw new Error('核实资料不完整');
 }
 return input as Woman[];
}
export function publicWomen(input:unknown){return parseWomen(input).filter(w=>w.status==='published')}
export const statusLabels:Record<Status,string>={candidate:'候选 · 待核实',researching:'研究中 · 待核实',verified:'已核实 · 待内容审核',published:'已审核发布'};
// Only verified metadata may appear in the public index; draft stories remain private.
export function directoryWomen(input:unknown){return parseWomen(input).filter(w=>w.status==='verified'||w.status==='published')}
export function relatedWomen(records:Woman[],woman:Woman,size=3){return records.filter(w=>w.status==='published'&&w.id!==woman.id).sort((a,b)=>Number(b.fields.some(f=>woman.fields.includes(f)))-Number(a.fields.some(f=>woman.fields.includes(f)))||a.slug.localeCompare(b.slug)).slice(0,size)}
export function browseWomen(records:Woman[],q='',field='',region='',page=1,size=12){
 const query=q.trim().toLocaleLowerCase();
 const matches=records.filter(w=>(!field||w.fields.includes(field))&&(!region||w.regions.includes(region))&&[w.nameZh,w.nameEn,...w.fields,...w.regions,...w.keywords].join(' ').toLocaleLowerCase().includes(query));
 const pages=Math.max(1,Math.ceil(matches.length/size));const current=Math.min(pages,Math.max(1,Number.isFinite(page)?Math.floor(page):1));
 return {items:matches.slice((current-1)*size,current*size),total:matches.length,pages,page:current};
}
