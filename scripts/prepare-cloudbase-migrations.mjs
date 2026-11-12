// Derive a reviewed CloudBase staging migration without changing the Supabase source.
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
const root='supabase/migrations/';
let schema=readFileSync(root+'202611100001_phase1_schema.sql','utf8');
schema=schema.replace('-- HerIsland Phase 1. Apply to a backed-up Supabase staging project first.','-- CloudBase PostgreSQL staging only. auth.uid() and auth.users.id are text.');
schema=schema.replace(/\b(id|owner_id|user_id|author_id|reporter_id|moderator_id|blocked_user_id|actor_id) uuid( (?:not null )?(?:primary key )?references auth\.users\(id\))/g,'$1 varchar(64)$2');
schema=schema.replaceAll('not_blocked(uid uuid)','not_blocked(uid text)').replaceAll('not_blocked(uuid)','not_blocked(text)').replaceAll('uid uuid=auth.uid()','uid text=auth.uid()');
schema=schema.replaceAll('raw_user_meta_data','user_metadata');
// Actual staging auth.users has a bigint id and a separate sub (verified 2026-11-12).
// Never alter vendor-owned auth tables or assume the documentation's id shape.
schema=schema.replace('id varchar(64) primary key references auth.users(id) on delete cascade','id varchar(64) primary key');
schema=schema.replaceAll('references auth.users(id)','references public.profiles(id)');
schema=schema.replace(/create function app_private.initialize_profile\(\)[\s\S]*?create trigger auth_profile[^;]*;\n/,'');
schema=schema.replace('app_private.initialize_profile(),app_private.validate_wall()','app_private.validate_wall()');
// Storage schemas differ between vendors. No bucket grants are imported blindly.
schema=schema.replace(/-- Private uploads\.[\s\S]*?(?=grant all on public\.profiles)/,'-- Media uploads remain disabled until CloudBase bucket policies are separately verified.\n');
schema=schema.replaceAll('target_id uuid not null','target_id text not null');
let imports=readFileSync(root+'202611100003_explicit_import.sql','utf8').replaceAll('uid uuid=auth.uid()','uid text=auth.uid()').replaceAll('raw_user_meta_data','user_metadata');
imports=imports.replace(/-- Backfill profiles only;[^\n]*\ninsert into public.profiles[^;]*;\n/,'-- Profiles are initialized only after a verified CloudBase login.\n');
let reports=readFileSync(root+'202611100004_report_integrity.sql','utf8').replaceAll('can_read_post(new.target_id)','can_read_post(new.target_id::uuid)').replaceAll('c.id=new.target_id','c.id=new.target_id::uuid');
mkdirSync('cloudbase/migrations',{recursive:true});
const sources=[schema,readFileSync(root+'202611100002_reference_seed.sql','utf8'),imports,reports,readFileSync(root+'202611100005_editorial_boundary.sql','utf8')];
sources.forEach((sql,i)=>writeFileSync(`cloudbase/migrations/00${i+1}.sql`,sql));
console.log('Prepared 5 CloudBase staging migrations. No remote writes.');
