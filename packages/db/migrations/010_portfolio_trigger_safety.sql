create or replace function pmmi_portfolio_outbox() returns trigger language plpgsql as $$
declare should_notify boolean:=false;
begin
  if tg_op='INSERT' then
    should_notify:=new.featured=true and new.published_at is not null;
  elsif tg_op='UPDATE' then
    should_notify:=new.featured=true and new.published_at is not null
      and (old.featured is distinct from new.featured or old.published_at is distinct from new.published_at);
  end if;
  if should_notify then
    insert into notification_outbox(event_type,source_type,source_id,payload,dedupe_key)
    values('portfolio.featured','portfolio_project',new.id::text,jsonb_build_object('userId',new.student_user_id,'title',new.title,'slug',new.slug),
      'portfolio:'||new.id::text) on conflict do nothing;
  end if;
  return new;
end $$;
