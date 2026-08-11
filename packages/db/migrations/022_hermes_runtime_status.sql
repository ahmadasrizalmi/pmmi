alter table hermes_profiles drop constraint if exists hermes_profiles_status_check;
alter table hermes_profiles
  add constraint hermes_profiles_status_check
  check (status in ('PENDING','BUILDING','READY','RUNNING','STOPPED','FAILED','ARCHIVED'));
