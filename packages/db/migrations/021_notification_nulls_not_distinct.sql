-- PostgreSQL 15+ supports NULLS NOT DISTINCT. PMMI targets PostgreSQL 16, so use one atomic
-- unique index that both preserves worker ON CONFLICT inference and deduplicates applicant rows.
drop index if exists notifications_applicant_dedupe_idx;
drop index if exists notifications_user_dedupe_idx;
drop trigger if exists trg_dedupe_userless_notification on notifications;
drop function if exists pmmi_dedupe_userless_notification();

create unique index notifications_user_dedupe_idx
  on notifications(user_id,dedupe_key) nulls not distinct
  where dedupe_key is not null;
