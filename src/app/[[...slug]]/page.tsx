import {serverSupabase,requireUser} from '@/lib/supabase/server';
export const dynamic='force-dynamic';
import {notFound} from 'next/navigation';
import {communities,stories} from '@/data';
import {dailyHost} from '@/features/island/daily-host';
import IslandHome from '@/features/island/island-home';
import {publishedWomen} from '@/features/women/catalog';
import {FeaturedWomen} from '@/components/women-cards';
import CommunityApp from "@/components/community-app";export default async function Page({params}:{params:Promise<{slug?:string[]}>}){const {slug=[]}=await params;const path='/'+slug.join('/');let account: {id:string;displayName:string;bio:string}|undefined;if(['/profile','/create'].includes(path)){const user=await requireUser(path);if(user&&path==='/profile'){const client=await serverSupabase();const {data}=await client.from('profiles').select('display_name,bio').eq('id',user.id).single();if(data)account={id:user.id,displayName:data.display_name,bio:data.bio};}}const plain=['/','/discussions','/communities','/profile','/login','/register','/create'];const localPost=slug.length===2&&slug[0]==='discussions'&&/^[a-zA-Z0-9-]+$/.test(slug[1]);const group=slug.length===2&&slug[0]==='communities'&&communities.some(c=>c.id===slug[1]);const story=slug.length===2&&slug[0]==='stories'&&/^[1-9]$/.test(slug[1])&&Number(slug[1])<=stories.length;if(!plain.includes(path)&&!localPost&&!group&&!story)notFound();return <CommunityApp path={"/"+slug.join("/")} account={account}>{slug.length===0&&<><IslandHome initialHost={dailyHost(publishedWomen)} people={publishedWomen.map(({slug,nameZh,occupation,fields,facts,sources})=>({slug,nameZh,occupation,fields,facts,sources}))}/><FeaturedWomen women={publishedWomen.filter(w=>w.featured).slice(0,10)}/></>}</CommunityApp>;}
export async function generateMetadata({params}:{params:Promise<{slug?:string[]}>}){const {slug=[]}=await params;return slug.length===0?{title:"HerIsland · 她的岛屿 | HerSpace"}:{}}
