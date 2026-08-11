create or replace function pmmi_provision_student_notification_channels()
returns trigger language plpgsql as $$
declare
  app applications%rowtype;
begin
  if NEW.application_id is null then return NEW; end if;
  select * into app from applications where id=NEW.application_id;
  if app.id is null then return NEW; end if;

  if app.email is not null and not exists (
    select 1 from user_notification_channels c
    where c.user_id=NEW.user_id and c.channel='EMAIL' and lower(c.address_or_external_id)=lower(app.email)
  ) then
    insert into user_notification_channels(user_id,channel,address_or_external_id,enabled,priority,metadata)
    values(NEW.user_id,'EMAIL',lower(app.email),true,10,jsonb_build_object('source','admission'));
  end if;

  if app.phone is not null and not exists (
    select 1 from user_notification_channels c
    where c.user_id=NEW.user_id and c.channel='WHATSAPP' and c.address_or_external_id=app.phone
  ) then
    insert into user_notification_channels(user_id,channel,address_or_external_id,enabled,priority,metadata)
    values(NEW.user_id,'WHATSAPP',app.phone,true,20,jsonb_build_object('source','admission','verification','required'));
  end if;
  return NEW;
end $$;

do $$ begin
  if not exists (select 1 from pg_trigger where tgname='trg_provision_student_notification_channels') then
    create trigger trg_provision_student_notification_channels
    after insert or update of application_id,user_id on students
    for each row execute function pmmi_provision_student_notification_channels();
  end if;
end $$;

create or replace function pmmi_verify_email_channel_on_activation()
returns trigger language plpgsql as $$
begin
  if NEW.is_active=true and OLD.is_active=false then
    update user_notification_channels
    set verified_at=coalesce(verified_at,now()),updated_at=now()
    where user_id=NEW.id and channel='EMAIL' and enabled=true;
  end if;
  return NEW;
end $$;

do $$ begin
  if not exists (select 1 from pg_trigger where tgname='trg_verify_email_channel_on_activation') then
    create trigger trg_verify_email_channel_on_activation
    after update of is_active on users
    for each row execute function pmmi_verify_email_channel_on_activation();
  end if;
end $$;
