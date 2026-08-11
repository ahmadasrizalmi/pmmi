-- Existing databases may contain duplicate applicant/user-less notifications because SQL UNIQUE
-- treats NULL user_id values as distinct. Remove older duplicates before migration 010 creates the
-- normalized unique index. Keep the oldest notification as the durable source of truth.
delete from notifications newer
using notifications older
where newer.user_id is null
  and older.user_id is null
  and newer.dedupe_key is not null
  and newer.dedupe_key=older.dedupe_key
  and newer.id>older.id;
