import {it,expect} from 'vitest';
import {publishedWomen,internalWomen} from '../src/features/women/catalog';
import {selectNPCs} from '../src/features/island/npc';
import {regions} from '../src/features/island/config';
it('six unique reproducible public NPCs',()=>{const a=selectNPCs(publishedWomen,42);expect(a).toHaveLength(6);expect(new Set(a.map(w=>w.slug)).size).toBe(6);expect(a).toEqual(selectNPCs(publishedWomen,42));expect(a).not.toEqual(selectNPCs(publishedWomen,99));expect(a.every(w=>publishedWomen.some(p=>p.slug===w.slug))).toBe(true);expect(internalWomen).toHaveLength(102)});
it('six regions use existing routes',()=>expect(regions.map(r=>r.href)).toEqual(['/discussions','/communities','/women','/ai','/profile','/discussions']));
