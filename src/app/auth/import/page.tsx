import Link from 'next/link';
import {requireUser} from '@/lib/supabase/server';
import ImportPanel from '@/features/auth/import-panel';
import CommunityApp from '@/components/community-app';
export const dynamic='force-dynamic';
export default async function Page(){const user=await requireUser('/auth/import');return <CommunityApp path="/auth/import">{user?<ImportPanel userId={user.id} email={user.email||''}/>:<section><h1>云端导入尚未启用</h1><p>当前是本地演示，原数据保持不变。</p><Link href="/profile">返回我的空间</Link></section>}</CommunityApp>}
