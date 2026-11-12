begin;
-- Preserve target identifiers for moderation history, but validate visibility at submission.
create function app_private.validate_report_target() returns trigger language plpgsql security definer set search_path='' as $$ begin
 if new.target_type='post' and not app_private.can_read_post(new.target_id::uuid) then raise exception 'target unavailable';end if;
 if new.target_type='comment' and not exists(select 1 from public.comments c where c.id=new.target_id::uuid and c.status='published' and c.deleted_at is null and app_private.can_read_post(c.post_id)) then raise exception 'target unavailable';end if;
 if new.target_type='user' and not exists(select 1 from public.profiles where id=new.target_id and status='active') then raise exception 'target unavailable';end if;
 return new;end $$;
revoke all on function app_private.validate_report_target() from public;
create trigger report_target before insert on public.reports for each row execute function app_private.validate_report_target();
commit;
