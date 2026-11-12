import {beforeAll,afterAll,describe,it,expect} from 'vitest';
import {PGlite} from '@electric-sql/pglite';
import {readFileSync} from 'node:fs';
const db=new PGlite();
async function asUser<T>(id:string,sql:string){
 return db.transaction(async tx=>{await tx.exec('set local role authenticated');await tx.query("select set_config('test.uid',$1,true)",[id]);return (await tx.query<T>(sql)).rows});
}
describe('CloudBase migration SQL with real local PostgreSQL semantics (not hosted acceptance)',()=>{
 beforeAll(async()=>{
  await db.exec(`create role anon;create role authenticated;create role service_role;create schema auth;grant usage on schema auth to anon,authenticated;create table auth.users(id varchar(64) primary key,user_metadata jsonb default '{}'::jsonb);create function auth.uid() returns text language sql stable as $$select nullif(current_setting('test.uid',true),'')$$;grant execute on function auth.uid() to anon,authenticated;`);
  for(let i=1;i<=5;i++)await db.exec(readFileSync(`cloudbase/migrations/00${i}.sql`,'utf8'));
  await db.exec(readFileSync('cloudbase/migrations/006_community.sql','utf8'));await db.exec(readFileSync('cloudbase/migrations/007_write_protection.sql','utf8'));
  await asUser('account-a','select herisland_ensure_profile()');await asUser('account-b','select herisland_ensure_profile()');
 },30000);
 afterAll(()=>db.close());
 it('blocks uninvited profile creation while launch is pending',async()=>{await db.exec(readFileSync('cloudbase/migrations/008_launch_gate.sql','utf8'));await expect(asUser('uninvited-account','select herisland_ensure_profile()')).rejects.toThrow();await asUser('account-a','select herisland_ensure_profile()')});
 it('seeds only reference material',async()=>{expect((await db.query<{count:number}>('select count(*)::int count from hobby_wall_items')).rows[0].count).toBe(74);expect((await db.query<{count:number}>('select count(*)::int count from posts')).rows[0].count).toBe(0)});
 it('prevents one account changing another profile or assuming admin',async()=>{await asUser('account-a',"update profiles set display_name='测试昵称' where id='account-a'");await asUser('account-b',"update profiles set display_name='越权' where id='account-a'");expect((await db.query<{display_name:string}>("select display_name from profiles where id='account-a'")).rows[0].display_name).toBe('测试昵称');await expect(asUser('account-a',"insert into app_private.admins values('account-a')")).rejects.toThrow()});
 it('blocks forged ownership and isolates drafts and bookmarks',async()=>{
  await expect(asUser('account-a',"insert into posts(author_id,title,content) values('account-b','伪造','测试')")).rejects.toThrow();
  const [p]=await asUser<{id:string}>('account-a',"insert into posts(author_id,title,content) values('account-a','私有草稿','测试内容') returning id");
  expect(await asUser('account-b',`select id from posts where id='${p.id}'`)).toHaveLength(0);
  await expect(asUser('account-a',`update posts set status='published' where id='${p.id}'`)).rejects.toThrow();
  await db.exec(`update posts set status='published' where id='${p.id}'`);
  await asUser('account-b',`insert into bookmarks(user_id,post_id) values('account-b','${p.id}')`);
  expect(await asUser('account-a','select * from bookmarks')).toHaveLength(0);
 });
 it('denies moderation and deletion of other accounts',async()=>{await expect(asUser('account-a','select herisland_review_queue()')).rejects.toThrow();await asUser('account-b','select herisland_request_deletion()');expect((await db.query<{status:string}>("select status from profiles where id='account-b'")).rows[0].status).toBe('deleted');expect((await db.query<{status:string}>("select status from profiles where id='account-a'")).rows[0].status).toBe('active');await expect(asUser('account-b',"insert into posts(author_id,title,content) values('account-b','禁止继续','测试')")).rejects.toThrow()});
 it('saves walls transactionally and refuses six items without losing the old wall',async()=>{
  await asUser('account-a',"select herisland_save_wall('[]'::jsonb,0)");
  await expect(asUser('account-a',`select herisland_save_wall('${JSON.stringify(Array(6).fill({}))}'::jsonb,1)`)).rejects.toThrow();
  expect(await asUser('account-b','select * from user_hobby_wall')).toHaveLength(0);await expect(asUser('account-a',"select herisland_save_wall('[]'::jsonb,0)")).rejects.toThrow();
 });
});
