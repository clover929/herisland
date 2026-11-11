import {verifyStaging} from './staging-preflight.mjs';
// REAL staging Supabase only. No mocks. Never run against production.
import {createClient} from '@supabase/supabase-js';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
const url=process.env.SUPABASE_TEST_URL,key=process.env.SUPABASE_TEST_PUBLISHABLE_KEY,secret=process.env.SUPABASE_TEST_SERVICE_ROLE_KEY;
if(process.env.RUN_SUPABASE_INTEGRATION!=='1'||!url||!key||!secret){console.log('SKIPPED: real Supabase Auth/RLS/two-user integration requires an explicit staging URL, keys and RUN_SUPABASE_INTEGRATION=1');process.exit(0)}
await verifyStaging(); // Fail closed before any remote write unless project identity is verified.
const uploaded=[];
const admin=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}}),ids=[];
const client=()=>createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
try{
 const accounts=[];
 for(const n of [1,2]){const email=`herisland-test-${randomUUID()}@example.com`,password='Test-'+randomUUID()+'aA1!';const created=await admin.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{display_name:`Test ${n}`,role:'admin'}});assert.ifError(created.error);ids.push(created.data.user.id);const sdk=client();const login=await sdk.auth.signInWithPassword({email,password});assert.ifError(login.error);accounts.push({sdk,id:created.data.user.id})}
 const [a,b]=accounts;
 const profile=await a.sdk.from('profiles').select('*').eq('id',a.id).single();assert.ifError(profile.error);assert.equal(profile.data.id,a.id);assert.equal(profile.data.role,undefined);
 const forge=await a.sdk.from('posts').insert({author_id:b.id,title:'forged',content:'must fail',status:'draft'});assert.ok(forge.error);
 const post=await a.sdk.from('posts').insert({author_id:a.id,title:'private draft',content:'A only',status:'draft'}).select().single();assert.ifError(post.error);
 const steal=await b.sdk.from('posts').select('*').eq('id',post.data.id);assert.ifError(steal.error);assert.equal(steal.data.length,0);
 const conv=await a.sdk.from('ai_conversations').insert({user_id:a.id,mode:'Companion'}).select().single();assert.ifError(conv.error);
 const privateRows=await b.sdk.from('ai_conversations').select('*').eq('id',conv.data.id);assert.equal(privateRows.data?.length,0);
 const badAssistant=await a.sdk.from('ai_messages').insert({conversation_id:conv.data.id,role:'assistant',content:'forged assistant'});assert.ok(badAssistant.error);
 const badAdmin=await a.sdk.from('moderation_actions').insert({moderator_id:a.id,target_type:'post',target_id:post.data.id,action:'hide',reason:'forged admin'});assert.ok(badAdmin.error);
 const assets=['film-canister','bracelet','keychain','postcard','washi','kalimba'];
 for(let i=0;i<5;i++){const data=await a.sdk.from('hobby_wall_items').select('mount_type').eq('id',assets[i]).single();assert.ifError(data.error);const row=await a.sdk.from('user_hobby_wall').insert({user_id:a.id,item_id:assets[i],slot:i+1,x:96+i*144,y:144,scale:1,mount_type:data.data.mount_type});assert.ifError(row.error)}
 const sixth=await a.sdk.from('user_hobby_wall').insert({user_id:a.id,item_id:assets[5],slot:6,x:816,y:144,scale:1,mount_type:'shelf'});assert.ok(sixth.error);
 const leaked=await b.sdk.from('user_hobby_wall').select('*').eq('user_id',a.id);assert.equal(leaked.data?.length,0);
 const invalid=await a.sdk.rpc('save_hobby_wall',{layout:Array(6).fill({itemId:'bracelet',x:96,y:144,scale:1,mountType:'hook'})});assert.ok(invalid.error);const preserved=await a.sdk.from('user_hobby_wall').select('id');assert.equal(preserved.data?.length,5);
 const collision=await a.sdk.rpc('save_hobby_wall',{layout:[{...preserved.data[0],itemId:'bracelet',x:288,y:240,scale:1,mountType:'hook'},{itemId:'film-canister',x:288,y:240,scale:1,mountType:'shelf'}]});assert.ok(collision.error);const afterCollision=await a.sdk.from('user_hobby_wall').select('id');assert.equal(afterCollision.data?.length,5);
 const first=await a.sdk.rpc('import_hobby_wall',{layout:[],source_hash:'a'.repeat(64),replace_existing:true});assert.ifError(first.error);assert.equal(first.data,true);const repeat=await a.sdk.rpc('import_hobby_wall',{layout:[],source_hash:'a'.repeat(64),replace_existing:true});assert.ifError(repeat.error);assert.equal(repeat.data,false);
 const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jP1sAAAAASUVORK5CYII=','base64');
 const media=await a.sdk.storage.from('herisland-user-media').upload(`${b.id}/forged.png`,png,{contentType:'image/png'});assert.ok(media.error);
 const ownPath=`${a.id}/integration-${randomUUID()}.png`;const ownMedia=await a.sdk.storage.from('herisland-user-media').upload(ownPath,png,{contentType:'image/png'});assert.ifError(ownMedia.error);uploaded.push(ownPath);
 const stolenMedia=await b.sdk.storage.from('herisland-user-media').download(ownPath);assert.ok(stolenMedia.error);
 const badType=await a.sdk.storage.from('herisland-user-media').upload(`${a.id}/invalid-${randomUUID()}.txt`,new Blob(['x']),{contentType:'text/plain'});assert.ok(badType.error);
 await a.sdk.auth.signOut();const signedOut=await a.sdk.from('ai_conversations').select('*');assert.ok(signedOut.error||signedOut.data?.length===0);
 console.log('PASSED: REAL Auth login/logout, profile trigger, forged ownership/admin denial, private AI isolation, five-slot DB limit, rollback, idempotent import, private upload denial');
}finally{if(uploaded.length){const cleanup=await admin.storage.from('herisland-user-media').remove(uploaded);if(cleanup.error)console.error('Own staging test upload cleanup failed')}for(const id of ids){const result=await admin.auth.admin.deleteUser(id);if(result.error)console.error('Staging test user cleanup failed (no secrets printed)')}}
