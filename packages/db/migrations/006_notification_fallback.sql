-- Explicit per-event fallback routing for external notifications.
alter table notification_deliveries add column if not exists fallback_for text;
alter table notification_deliveries add column if not exists is_fallback boolean not null default false;
create index if not exists notification_delivery_fallback_idx on notification_deliveries(notification_id,fallback_for,is_fallback);
