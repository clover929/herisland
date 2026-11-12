-- Keep real staging functions available to existing invited profiles while
-- business/filing/registration acceptance is pending. This is enforced in SQL.
begin;
create table app_private.launch_policy(id boolean primary key default true check(id),public_registration boolean not null default false);
insert into app_private.launch_policy(id) values(true);
revoke all on app_private.launch_policy from public,anon,authenticated;
create or replace function public.herisland_ensure_profile() returns void language plpgsql security definer set search_path='' as $$begin
 if auth.uid() is null or length(auth.uid())>64 then raise exception 'authentication required';end if;
 if exists(select 1 from public.profiles where id=auth.uid()) then return;end if;
 if not exists(select 1 from app_private.launch_policy where id and public_registration) then raise exception 'invitation required during staging acceptance';end if;
 insert into public.profiles(id) values(auth.uid()) on conflict(id) do nothing;
end$$;
commit;
