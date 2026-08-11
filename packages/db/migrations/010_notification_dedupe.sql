-- PostgreSQL UNIQUE treats NULL values as distinct. Applicant notifications have no users.id yet,
-- so normalize NULL user_id to a sentinel UUID for durable outbox idempotency.
drop index if exists notifications_user_dedupe_idx;
create unique index if not exists notifications_user_dedupe_idx
  on notifications ((coalesce(user_id,'00000000-0000-0000-0000-000000000000'::uuid)), dedupe_key)
  where dedupe_key is not null;
