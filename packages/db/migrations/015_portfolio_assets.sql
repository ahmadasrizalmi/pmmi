create table if not exists portfolio_assets (
  id uuid primary key default gen_random_uuid(),
  portfolio_project_id uuid not null references portfolio_projects(id) on delete cascade,
  submission_file_id uuid references submission_files(id) on delete set null,
  bucket text not null,
  object_key text not null,
  original_name text not null,
  content_type text,
  size_bytes bigint check (size_bytes is null or size_bytes >= 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique(portfolio_project_id,object_key)
);
create index if not exists portfolio_assets_project_idx on portfolio_assets(portfolio_project_id,sort_order,created_at);

create or replace function pmmi_snapshot_portfolio_assets()
returns trigger language plpgsql as $$
begin
  if NEW.submission_id is not null and NEW.featured = true then
    insert into portfolio_assets(portfolio_project_id,submission_file_id,bucket,object_key,original_name,content_type,size_bytes,sort_order)
    select NEW.id,sf.id,sf.bucket,sf.object_key,sf.original_name,sf.content_type,sf.size_bytes,
           row_number() over(order by sf.created_at,sf.id)::integer - 1
    from submission_files sf
    where sf.submission_id = NEW.submission_id
    on conflict(portfolio_project_id,object_key) do nothing;
  end if;
  return NEW;
end $$;

do $$ begin
  if not exists (select 1 from pg_trigger where tgname='trg_snapshot_portfolio_assets') then
    create trigger trg_snapshot_portfolio_assets
    after insert or update of featured,submission_id on portfolio_projects
    for each row execute function pmmi_snapshot_portfolio_assets();
  end if;
end $$;

-- Backfill projects already featured before this migration.
insert into portfolio_assets(portfolio_project_id,submission_file_id,bucket,object_key,original_name,content_type,size_bytes,sort_order)
select pp.id,sf.id,sf.bucket,sf.object_key,sf.original_name,sf.content_type,sf.size_bytes,
       row_number() over(partition by pp.id order by sf.created_at,sf.id)::integer - 1
from portfolio_projects pp
join submission_files sf on sf.submission_id=pp.submission_id
where pp.featured=true
on conflict(portfolio_project_id,object_key) do nothing;
