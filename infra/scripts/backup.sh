#!/usr/bin/env bash
set -Eeuo pipefail

: "${DATABASE_URL:?DATABASE_URL is required}"
: "${BACKUP_ROOT:=/srv/pmmi/backups}"
: "${MINIO_ENDPOINT:?MINIO_ENDPOINT is required}"
: "${MINIO_ACCESS_KEY:?MINIO_ACCESS_KEY is required}"
: "${MINIO_SECRET_KEY:?MINIO_SECRET_KEY is required}"
: "${MINIO_BUCKET:=pmmi}"

for cmd in pg_dump psql mc sha256sum; do command -v "$cmd" >/dev/null || { echo "Missing command: $cmd" >&2; exit 1; }; done

ts="$(date -u +%Y%m%dT%H%M%SZ)"
dir="${BACKUP_ROOT}/${ts}"
mkdir -p "$dir/minio"
run_id="$(psql "$DATABASE_URL" -Atc "insert into backup_runs(kind,status) values('FULL','RUNNING') returning id" | tail -n1)"

fail() {
  local code=$?
  psql "$DATABASE_URL" -c "update backup_runs set status='FAILED',finished_at=now(),last_error='backup command failed with exit ${code}' where id='${run_id}'" >/dev/null 2>&1 || true
  psql "$DATABASE_URL" -c "insert into ops_events(kind,severity,source,message,data) values('backup.failed','CRITICAL','backup','PMMI full backup failed',jsonb_build_object('backupRunId','${run_id}','exitCode',${code}))" >/dev/null 2>&1 || true
  exit "$code"
}
trap fail ERR

pg_dump "$DATABASE_URL" --format=custom --no-owner --file "$dir/postgres.dump"
mc alias set pmmi-backup "$MINIO_ENDPOINT" "$MINIO_ACCESS_KEY" "$MINIO_SECRET_KEY" >/dev/null
mc mirror --overwrite "pmmi-backup/${MINIO_BUCKET}" "$dir/minio/${MINIO_BUCKET}"

(
  cd "$dir"
  find . -type f ! -name SHA256SUMS -print0 | sort -z | xargs -0 sha256sum > SHA256SUMS
)
checksum="$(sha256sum "$dir/SHA256SUMS" | awk '{print $1}')"
size="$(du -sb "$dir" | awk '{print $1}')"

psql "$DATABASE_URL" -c "update backup_runs set status='SUCCEEDED',finished_at=now(),artifact_path='${dir}',size_bytes=${size},checksum='${checksum}' where id='${run_id}'" >/dev/null
trap - ERR

echo "PMMI backup complete: $dir"
