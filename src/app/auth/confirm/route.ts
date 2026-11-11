import {NextRequest,NextResponse} from 'next/server';
import {serverSupabase} from '@/lib/supabase/server';
export const dynamic='force-dynamic';
export async function GET(request:NextRequest){const hash=request.nextUrl.searchParams.get('token_hash'),type=request.nextUrl.searchParams.get('type');try{if(hash&&(type==='signup'||type==='recovery'||type==='email')){const client=await serverSupabase();const {error}=await client.auth.verifyOtp({token_hash:hash,type});if(!error)return NextResponse.redirect(new URL(type==='recovery'?'/auth/reset':'/profile',request.url),{headers:{'Cache-Control':'private, no-store'}})}}catch{}return NextResponse.redirect(new URL('/login?authError=verification',request.url))}
