import CloudbaseAuthPanel from '@/features/cloudbase/auth-panel';
import AuthPanel from '@/features/auth/auth-panel';
import CommunityApp from '@/components/community-app';
import {supabaseMode} from '@/lib/supabase/config';
import {requireUser} from '@/lib/supabase/server';
export const dynamic='force-dynamic';
export default async function Page({searchParams}:{searchParams:Promise<Record<string,string|undefined>>}){const {request}=await searchParams;if(request!=='1'&&supabaseMode())await requireUser('/auth/reset');return <CommunityApp path="/auth/reset">{process.env.NEXT_PUBLIC_DATA_MODE==='cloudbase'?<CloudbaseAuthPanel mode="reset"/>:<AuthPanel mode={request==='1'?'reset':'update-password'}/>}</CommunityApp>}
