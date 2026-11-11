begin;
-- The caller's verified JWT fixes the destination owner. No user_id argument.
create function public.import_hobby_wall(layout jsonb, source_hash text, replace_existing boolean default false) returns boolean language plpgsql security definer set search_path='' as $$
 declare uid uuid=auth.uid();begin
 if uid is null or not app_private.active_user() then raise exception 'authentication required';end if;
 if source_hash !~ '^[0-9a-f]{64}$' then raise exception 'invalid source hash';end if;
 perform 1 from public.profiles where id=uid for update;
 if exists(select 1 from public.import_receipts r where r.user_id=uid and r.source_hash=import_hobby_wall.source_hash and r.scope='hobby_wall') then return false;end if;
 if not replace_existing and exists(select 1 from public.user_hobby_wall where user_id=uid) then raise exception 'existing cloud wall requires explicit replacement consent';end if;
 perform public.save_hobby_wall(layout);
 insert into public.import_receipts(user_id,source_hash,scope) values(uid,source_hash,'hobby_wall');return true;
 end $$;
revoke all on function public.import_hobby_wall(jsonb,text,boolean) from public;
grant execute on function public.import_hobby_wall(jsonb,text,boolean) to authenticated;
-- Backfill profiles only; never overwrite existing identity data.
insert into public.profiles(id,display_name) select id,left(coalesce(nullif(trim(raw_user_meta_data->>'display_name'),''),'岛屿来客'),80) from auth.users on conflict(id) do nothing;
create function app_private.validate_comment_parent() returns trigger language plpgsql security definer set search_path='' as $$ begin
 if new.parent_id is not null and not exists(select 1 from public.comments where id=new.parent_id and post_id=new.post_id) then raise exception 'parent must belong to the same post';end if;return new;end $$;
create trigger same_post_parent before insert or update on public.comments for each row execute function app_private.validate_comment_parent();
revoke all on function app_private.validate_comment_parent() from public;
commit;
