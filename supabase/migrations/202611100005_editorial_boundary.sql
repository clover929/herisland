begin;
-- Preserve full source records for editors; expose only an explicit public projection.
alter table public.women_profiles add column public_data jsonb not null default '{}'::jsonb check(jsonb_typeof(public_data)='object');
update public.women_profiles set public_data=source_data-'editorialNotes';
revoke select on public.women_profiles from anon,authenticated;
grant select(id,slug,name_zh,name_en,status,public_data,created_at,updated_at) on public.women_profiles to anon,authenticated;
-- Verified directory names remain public, while unpublished stories and research notes do not.
create function public.women_directory() returns table(id text,slug text,name_zh text,name_en text,status text) language sql stable security definer set search_path='' as $$
 select w.id,w.slug,w.name_zh,w.name_en,w.status from public.women_profiles w where w.status in ('verified','published') and w.deleted_at is null
$$;
revoke all on function public.women_directory() from public;
grant execute on function public.women_directory() to anon,authenticated;
create function app_private.sync_women_public_data() returns trigger language plpgsql set search_path='' as $$ begin new.public_data=new.source_data-'editorialNotes';return new;end $$;
revoke all on function app_private.sync_women_public_data() from public;
create trigger women_public_projection before insert or update of source_data on public.women_profiles for each row execute function app_private.sync_women_public_data();
commit;
