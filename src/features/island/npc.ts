import type {Woman} from '../women/schema';
import {regions} from './config';
export type IslandPerson=Pick<Woman,'slug'|'nameZh'|'occupation'|'fields'|'facts'|'sources'>;
export function selectNPCs(records:IslandPerson[],seed:number){let state=seed>>>0;const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296};const pool=[...records].sort((a,b)=>a.slug.localeCompare(b.slug));return regions.map(region=>{const related=pool.filter(w=>w.fields.some(f=>(region.fields as readonly string[]).includes(f)));const candidates=related.length?related:pool;const person=candidates[Math.floor(random()*candidates.length)];if(person)pool.splice(pool.indexOf(person),1);return person}).filter((p):p is IslandPerson=>!!p)}
