#!/usr/bin/env bash
set -Eeuo pipefail

: "${CONFIRM_RESTORE:?Set CONFIRM_RESTORE=YES to allow destructive restore}"
[[ "$CONFIRM_RESTORE" == "YES" ]] || { echo "Refusing restore without CONFIRM_RESTORE=YES" >&2; exit 2; }
: "${DATABASE_URL:?DATABASE_URL is required}"
: "${MINIO_ENDPOINT:?MINIO_ENDPOINT is required}"
: "${MINIO_ACCESS_KEY:?MINIO_ACCESS_KEY is required}"
: "${MINIO_SECRET_KEY:?MINIO_SECRET_KEY is required}"
: "${MINIO_BUCKET:=pmmi}"

backup_dir="${1:?Usage: restore.sh /path/to/backup}"
[[ -f "$backup_dir/postgres.dump" ]] || { echo "postgres.dump missing" >&2; exit 2; }
[[ -f "$backup_dir/SHA256SUMS" ]] || { echo "SHA256SUMS missing" >&2; exit 2; }

for cmd in pg_restore mc sha256sum; do command -v "$cmd" >/dev/null || { echo "Missing command: $cmd" >&2; exit 1; }; done
(
  cd "$backup_dir"
  sha256sum -c SHA256SUMS
)

pg_restore --dbname "$DATABASE_URL" --clean --if-exists --no-owner "$backup_dir/postgres.dump"

if [[ -d "$backup_dir/minio/$MINIO_BUCKET" ]]; then
  mc alias set pmmi-restore "$MINIO_ENDPOINT" "$MINIO_ACCESS_KEY" "$MINIO_SECRET_KEY" >/dev/null
  mc mirror --overwrite "$backup_dir/minio/$MINIO_BUCKET" "pmmi-restore/$MINIO_BUCKET"
fi

echo "PMMI restore complete from: $backup_dir"
