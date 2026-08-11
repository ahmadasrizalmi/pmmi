-- Route operational records into the same durable notification outbox.
do $$ begin
  if not exists (select 1 from pg_trigger where tgname='trg_ops_event_outbox') then
    create trigger trg_ops_event_outbox after insert on ops_events
    for each row execute function pmmi_emit_event('ops.event','ops_event');
  end if;
end $$;
