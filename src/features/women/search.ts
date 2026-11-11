import type {Woman} from './schema';
const normalize=(s:string)=>s.normalize('NFKC').toLowerCase().replace(/[·•]/g,' ').trim();
export function searchWomen(records:Woman[],query:string,limit=5):Woman[]{
 const q=normalize(query);if(!q)return [];
 const publicRecords=records.filter(w=>w.status==='published'&&w.lastVerifiedAt&&w.reviewedAt);
 const named=publicRecords.filter(w=>[w.nameZh,w.nameEn].some(n=>q.includes(normalize(n))));if(named.length)return named.slice(0,limit);
 const clean=q.replace(/有哪些|有没有|值得了解的|女性|人物|请介绍|哪些|取得过|重要成就|领域|推荐|跨领域|的人|一位叫作|？|\?/g,' ');
 const terms=Array.from(new Set(clean.match(/[a-z0-9]+|[\u4e00-\u9fff]{2,}/g)||[]));
 if(/科技|技术/.test(q))terms.push('计算','计算机','航天');
 if(/数学家/.test(q))terms.push('数学');
 if(/奥运冠军/.test(q))terms.push('奥运','金牌');
 const eligible=/数学家/.test(q)?publicRecords.filter(w=>w.occupation.includes('数学')):/奥运冠军/.test(q)?publicRecords.filter(w=>/奥运/.test(w.facts.map(f=>f.claim).join(' '))&&/金牌|冠军/.test(w.facts.map(f=>f.claim).join(' '))):publicRecords;
 const ranked=eligible.map(w=>{const meta=normalize([w.occupation,...w.fields,...w.keywords].join(' '));const full=normalize([w.nameZh,w.nameEn,w.summary,...w.facts.map(f=>f.claim),w.story].join(' '));let score=0;for(const term of terms){if(meta.includes(term))score+=6;else if(full.includes(term))score+=2}return {w,score}}).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.w.slug.localeCompare(b.w.slug));
 if(!/跨领域/.test(q))return ranked.slice(0,limit).map(x=>x.w);
 const selected:Woman[]=[];const fields=new Set<string>();for(const {w} of ranked)if(w.fields.some(f=>!fields.has(f))){selected.push(w);w.fields.forEach(f=>fields.add(f));if(selected.length===limit)return selected}return [...selected,...ranked.map(x=>x.w).filter(w=>!selected.includes(w))].slice(0,limit);
}
export function evidenceFor(women:Woman[]){return women.flatMap(w=>w.facts.map((f,i)=>({id:w.slug+':'+i,name:w.nameZh,occupation:w.occupation,claim:f.claim,detail:'/women/'+w.slug,sources:w.sources.filter(s=>f.sourceUrls.includes(s.url)).map(s=>({title:s.title,url:s.url}))}))).filter(f=>f.sources.length>0)}
