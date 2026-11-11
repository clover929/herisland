import {NextRequest,NextResponse} from 'next/server';
import {serverSupabase} from '@/lib/supabase/server';
import {safeNext} from '@/lib/supabase/config';
export const dynamic='force-dynamic';
export async function GET(request:NextRequest){try{const code=request.nextUrl.searchParams.get('code');if(code){const client=await serverSupabase();const {error}=await client.auth.exchangeCodeForSession(code);if(!error)return NextResponse.redirect(new URL(safeNext(request.nextUrl.searchParams.get('next')),request.url),{headers:{'Cache-Control':'private, no-store'}})}}catch{}return NextResponse.redirect(new URL('/login?authError=callback',request.url))}
