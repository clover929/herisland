import {it,expect} from 'vitest';
import {dailyHost} from '../src/features/island/daily-host';
import {publishedWomen} from '../src/features/women/catalog';
import {selectNPCs} from '../src/features/island/npc';
it('Shanghai day is identical across clients and changes at UTC16',()=>{const a=dailyHost(publishedWomen,new Date('2026-11-09T01:00:00Z'));const b=dailyHost([...publishedWomen].reverse(),new Date('2026-11-09T15:59:59Z'));expect(a.date).toBe('2026-11-09');expect(a.person?.slug).toBe(b.person?.slug);const c=dailyHost(publishedWomen,new Date('2026-11-09T16:00:00Z'));expect(c.date).toBe('2026-11-10');expect(c.person?.slug).not.toBe(a.person?.slug)});
it('ten public hosts rotate without short repeats; six NPCs exclude host',()=>{const hosts=new Set();for(let i=0;i<10;i++){const host=dailyHost(publishedWomen,new Date(Date.UTC(2026,10,1+i))).person!;hosts.add(host.slug);const npcs=selectNPCs(publishedWomen.filter(p=>p.slug!==host.slug),42);expect(npcs).toHaveLength(6);expect(npcs.every(p=>p.slug!==host.slug)).toBe(true);expect(new Set(npcs.map(p=>p.slug)).size).toBe(6)}expect(hosts.size).toBe(10)});
it('empty host pool is safe',()=>expect(dailyHost([],new Date('2026-11-09T00:00:00Z')).person).toBeNull());
