begin;
create table app_private.wall_revisions(user_id varchar(64) primary key references public.profiles(id) on delete cascade,revision bigint not null default 0);
revoke all on app_private.wall_revisions from public,anon,authenticated;
create function public.herisland_wall_revision() returns bigint language sql stable security definer set search_path='' as $$select coalesce((select revision from app_private.wall_revisions where user_id=auth.uid()),0)$$;
create function public.herisland_save_wall(layout jsonb,expected_revision bigint) returns bigint language plpgsql security definer set search_path='' as $$declare version bigint;begin
 if not app_private.active_user() then raise exception 'authentication required';end if;
 insert into app_private.wall_revisions(user_id) values(auth.uid()) on conflict do nothing;
 select revision into version from app_private.wall_revisions where user_id=auth.uid() for update;
 if expected_revision is null or expected_revision<>version then raise exception 'wall changed; reload before saving';end if;
 perform public.save_hobby_wall(layout);
 update app_private.wall_revisions set revision=revision+1 where user_id=auth.uid() returning revision into version;
 return version;
end$$;
revoke all on function public.herisland_wall_revision(),public.herisland_save_wall(jsonb,bigint) from public;
grant execute on function public.herisland_wall_revision(),public.herisland_save_wall(jsonb,bigint) to authenticated;
revoke execute on function public.save_hobby_wall(jsonb) from authenticated;
revoke insert,update,delete on public.user_hobby_wall from authenticated;
-- Shared database limits cover concurrent requests and multiple hosting instances.
create function app_private.community_write_limit() returns trigger language plpgsql security definer set search_path='' as $$declare uid text=auth.uid();amount integer;begin
 if uid is null then raise exception 'authentication required';end if;
 perform pg_advisory_xact_lock(hashtextextended(uid||':'||tg_table_name,0));
 if tg_table_name='posts' then select count(*) into amount from public.posts where author_id=uid and created_at>now()-interval '1 minute';if amount>=5 then raise exception 'please wait before posting again';end if;
 elsif tg_table_name='comments' then select count(*) into amount from public.comments where author_id=uid and created_at>now()-interval '1 minute';if amount>=20 then raise exception 'please wait before commenting again';end if;
 elsif tg_table_name='reports' then select count(*) into amount from public.reports where reporter_id=uid and created_at>now()-interval '1 minute';if amount>=5 then raise exception 'please wait before reporting again';end if;end if;
 return new;
end$$;
revoke all on function app_private.community_write_limit() from public;
create trigger community_write_limit before insert on public.posts for each row execute function app_private.community_write_limit();
create trigger community_write_limit before insert on public.comments for each row execute function app_private.community_write_limit();
create trigger community_write_limit before insert on public.reports for each row execute function app_private.community_write_limit();
commit;
