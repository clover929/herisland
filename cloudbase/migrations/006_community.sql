-- Additional community fields and moderator-only operations. No administrator is seeded.
begin;
create function public.herisland_ensure_profile() returns void language plpgsql security definer set search_path='' as $$begin
 if auth.uid() is null or length(auth.uid())>64 then raise exception 'authentication required';end if;
 insert into public.profiles(id) values(auth.uid()) on conflict(id) do nothing;
end$$;
revoke all on function public.herisland_ensure_profile() from public;
grant execute on function public.herisland_ensure_profile() to authenticated;
alter table public.posts add column category text not null default '兴趣与创作' check(length(category) between 1 and 80);
alter table public.posts add column discussion_mode text not null default '开放讨论' check(discussion_mode in ('倾听模式','求助模式','开放讨论','资源征集'));
grant update(category,discussion_mode) on public.posts to authenticated;
-- Submitted posts stay private drafts until approved by a separately appointed moderator.
drop policy create_own_post on public.posts;
create policy create_own_post on public.posts for insert to authenticated with check(app_private.active_user() and author_id=auth.uid() and status='draft' and not is_demo and (community_id is null or exists(select 1 from public.community_members m where m.community_id=posts.community_id and m.user_id=auth.uid() and m.status='active')));
drop policy edit_own_post on public.posts;
create policy edit_own_post on public.posts for update to authenticated using(author_id=auth.uid() and status in ('draft','published')) with check(app_private.active_user() and author_id=auth.uid() and status='draft');
create function public.herisland_is_moderator() returns boolean language sql stable security definer set search_path='' as $$select app_private.active_user() and exists(select 1 from app_private.admins where user_id=auth.uid())$$;
revoke all on function public.herisland_is_moderator() from public;
grant execute on function public.herisland_is_moderator() to authenticated;
create function public.herisland_review_queue() returns jsonb language plpgsql stable security definer set search_path='' as $$begin
 if not public.herisland_is_moderator() then raise exception 'moderator required';end if;
 return jsonb_build_object('posts',coalesce((select jsonb_agg(p) from (select id,title,content,author_id,created_at,status from public.posts where status='draft' and deleted_at is null order by created_at limit 100) p),'[]'::jsonb),'reports',coalesce((select jsonb_agg(r) from (select id,target_type,target_id,reason,status,created_at from public.reports where status='pending' order by created_at limit 100) r),'[]'::jsonb));
end$$;
create function public.herisland_moderate(target_kind text,target text,decision text,reason_text text) returns void language plpgsql security definer set search_path='' as $$begin
 if not public.herisland_is_moderator() then raise exception 'moderator required';end if;
 if length(trim(reason_text)) not between 1 and 2000 then raise exception 'reason required';end if;
 if target_kind='post' and decision in ('approve','hide') then
 update public.posts set status=case when decision='approve' then 'published' else 'hidden' end where id=target::uuid and deleted_at is null;
 elsif target_kind='comment' and decision='hide' then update public.comments set status='hidden' where id=target::uuid;
 elsif target_kind='report' and decision='resolve' then update public.reports set status='resolved' where id=target::uuid;
 else raise exception 'invalid moderation action';end if;
 if not found then raise exception 'target unavailable';end if;
 insert into public.audit_logs(actor_id,event,target_type,target_id,metadata) values(auth.uid(),'moderation.'||decision,target_kind,target,jsonb_build_object('reason',reason_text));
end$$;
revoke all on function public.herisland_review_queue(),public.herisland_moderate(text,text,text,text) from public;
grant execute on function public.herisland_review_queue(),public.herisland_moderate(text,text,text,text) to authenticated;
-- Account deletion immediately removes public content and denies future writes.
-- The request is retained for operator completion of identity-provider deletion.
create function public.herisland_request_deletion() returns void language plpgsql security definer set search_path='' as $$begin
 if not app_private.active_user() then raise exception 'authentication required';end if;
 insert into public.account_deletion_requests(user_id) values(auth.uid());
 update public.posts set status='removed',deleted_at=now() where author_id=auth.uid();
 update public.comments set status='removed',deleted_at=now() where author_id=auth.uid();
 update public.profiles set status='deleted',deleted_at=now(),display_name='已注销用户',bio='',avatar_path=null where id=auth.uid();
 insert into public.audit_logs(actor_id,event) values(auth.uid(),'account.deletion_requested');
end$$;
revoke all on function public.herisland_request_deletion() from public;
grant execute on function public.herisland_request_deletion() to authenticated;
commit;
