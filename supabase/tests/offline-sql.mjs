// Executes actual PostgreSQL RLS in PGlite with a test-only Auth/Storage schema.
// This is NOT Supabase Auth, SMTP, Storage API or hosted integration validation.
import {PGlite} from '@electric-sql/pglite';
import {readFileSync,readdirSync} from 'node:fs';
import assert from 'node:assert/strict';
const db=new PGlite();let checks=0;
const check=(value,label)=>{assert.ok(value,label);checks++};
const denied=async(sql,params=[])=>{try{await db.query(sql,params);return false}catch{return true}};
try{
 await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create schema storage;
 create table auth.users(id uuid primary key,raw_user_meta_data jsonb not null default '{}');
 create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
 create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
 create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text references storage.buckets(id),name text);
 alter table storage.objects enable row level security;
 create function storage.foldername(name text) returns text[] language sql immutable as $$ select (string_to_array(name,'/'))[1:array_length(string_to_array(name,'/'),1)-1] $$;
 grant usage on schema auth,storage to anon,authenticated;grant select,insert,delete on storage.objects to authenticated;`);
 for(const file of readdirSync('supabase/migrations').sort()){await db.exec(readFileSync('supabase/migrations/'+file,'utf8'));console.log('SQL applied:',file)}
 // Reference seed is independently repeatable and creates no demo users/posts.
 await db.exec(readFileSync('supabase/migrations/202611100002_reference_seed.sql','utf8'));
 check((await db.query('select count(*)::int n from public.hobby_wall_items')).rows[0].n===74,'74 stable assets');check((await db.query('select count(*)::int n from public.women_profiles')).rows[0].n===102,'102 women');check((await db.query('select count(*)::int n from public.communities')).rows[0].n===6,'6 communities');check((await db.query('select count(*)::int n from public.posts')).rows[0].n===0,'no fake user posts');
 const a='11111111-1111-4111-8111-111111111111',b='22222222-2222-4222-8222-222222222222';
 await db.query("insert into auth.users(id,raw_user_meta_data) values($1,'{\"display_name\":\"A\",\"role\":\"admin\"}'),($2,'{\"display_name\":\"B\"}')",[a,b]);
 check((await db.query('select count(*)::int n from public.profiles')).rows[0].n===2,'profile trigger');
 await db.exec('set role anon');check((await db.query('select count(*)::int n from public.women_profiles')).rows[0].n===10,'only published women visible');check(await denied('select source_data from public.women_profiles'),'editorial notes are private');check((await db.query('select count(*)::int n from public.women_directory()')).rows[0].n===102,'102 safe directory names remain public');check(await denied("insert into public.posts(author_id,title,content) values($1,'x','x')",[a]),'anonymous cannot write');
 async function asUser(id){await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id]);await db.exec('set role authenticated')}
 await asUser(a);
 check(await denied("insert into public.posts(author_id,title,content) values($1,'forge','forge')",[b]),'cannot forge author');
 const post=(await db.query("insert into public.posts(author_id,title,content) values($1,'draft','private') returning id",[a])).rows[0].id;
 const conv=(await db.query("insert into public.ai_conversations(user_id,mode) values($1,'Companion') returning id",[a])).rows[0].id;
 check(await denied("insert into public.ai_messages(conversation_id,role,content) values($1,'assistant','forged')",[conv]),'cannot forge assistant');
 check(await denied("update public.profiles set status='suspended' where id=$1",[b]),'cannot edit admin-only columns');
 check(await denied("insert into public.audit_logs(actor_id,event) values($1,'forged')",[a]),'audit writes denied');
 check(await denied("insert into public.moderation_actions(moderator_id,target_type,target_id,action,reason) values($1,'post',$2,'hide','forge')",[a,post]),'metadata role gives no moderation privilege');
 const assets=['film-canister','bracelet','keychain','postcard','washi'];
 const wall=[];for(let i=0;i<5;i++){const item=(await db.query('select mount_type from public.hobby_wall_items where id=$1',[assets[i]])).rows[0];wall.push({itemId:assets[i],x:96+i*144,y:144,scale:1,rotation:0,mountType:item.mount_type})}
 await db.query('select public.save_hobby_wall($1::jsonb)',[JSON.stringify(wall)]);
 check((await db.query('select count(*)::int n from public.user_hobby_wall')).rows[0].n===5,'five items saved');
 check(await denied("insert into public.user_hobby_wall(user_id,item_id,slot,x,y,mount_type) values($1,'kalimba',6,816,144,'shelf')",[a]),'sixth slot impossible');
 check(await denied('select public.save_hobby_wall($1::jsonb)',[JSON.stringify([...wall,wall[0]])]),'RPC rejects six');check((await db.query('select count(*)::int n from public.user_hobby_wall')).rows[0].n===5,'failed replacement rolls back');
 check(await denied("update public.user_hobby_wall set scale=3,x=0 where user_id=$1",[a]),'bounds checked in database');
 await asUser(b);check((await db.query('select * from public.posts where id=$1',[post])).rows.length===0,'private draft isolation');check((await db.query('select * from public.ai_conversations where id=$1',[conv])).rows.length===0,'private AI isolation');check((await db.query('select * from public.user_hobby_wall where user_id=$1',[a])).rows.length===0,'private wall isolation');
 check(await denied("insert into public.user_hobby_wall(user_id,item_id,slot,x,y,mount_type) values($1,'kalimba',1,96,144,'shelf')",[a]),'cannot forge wall owner');
 check(await denied("insert into storage.objects(bucket_id,name) values('herisland-user-media',$1)",[a+'/forged.png']),'cannot upload to another user folder');
 await asUser(a);check(await denied('select public.import_hobby_wall($1::jsonb,$2,false)',['[]','a'.repeat(64)]),'existing cloud wall requires explicit consent');const first=await db.query('select public.import_hobby_wall($1::jsonb,$2,true) imported',['[]','a'.repeat(64)]);check(first.rows[0].imported===true,'explicit import');const repeat=await db.query('select public.import_hobby_wall($1::jsonb,$2,true) imported',['[]','a'.repeat(64)]);check(repeat.rows[0].imported===false,'idempotent import');
 await db.exec('reset role');await db.query("update public.profiles set status='suspended' where id=$1",[a]);await asUser(a);check(await denied("insert into public.posts(author_id,title,content) values($1,'suspended','no')",[a]),'suspended user cannot publish');
 console.log(`PASSED ${checks} actual PostgreSQL checks in OFFLINE PGlite; hosted Supabase Auth and RLS integration remains unverified`);
}finally{await db.close()}
