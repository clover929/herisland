import CommunityApp from '@/components/community-app';
import Sunny from '@/components/sunny';
export default function Page(){return <CommunityApp path="/ai"><Sunny embedded cloudUnavailable={process.env.VERCEL==='1'}/></CommunityApp>}
