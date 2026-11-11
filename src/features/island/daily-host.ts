import type {IslandPerson} from './npc';
export const ISLAND_TIMEZONE='Asia/Shanghai';
export function dailyHost(people:IslandPerson[],now=new Date()){
 const day=Math.floor((now.getTime()+8*60*60*1000)/86400000);
 const date=new Date(day*86400000).toISOString().slice(0,10);
 const pool=[...people].sort((a,b)=>a.slug.localeCompare(b.slug));
 return {date,person:pool.length?pool[((day%pool.length)+pool.length)%pool.length]:null};
}
