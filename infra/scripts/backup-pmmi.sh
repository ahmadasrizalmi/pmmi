#!/usr/bin/env bash
set -euo pipefail
: "${DATABASE_URL:?DATABASE_URL is required}"
: "${MINIO_ENDPOINT:?MINIO_ENDPOINT is required}"
: "${MINIO_ACCESS_KEY:?MINIO_ACCESS_KEY is required}"
: "${MINIO_SECRET_KEY:?MINIO_SECRET_KEY is required}"
MINIO_BUCKET="${MINIO_BUCKET:-pmmi}"
BACKUP_ROOT="${PMMI_BACKUP_ROOT:-/srv/pmmi/backups}"
RETENTION_DAYS="${PMMI_BACKUP_RETENTION_DAYS:-14}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
DB_DIR="$BACKUP_ROOT/postgres"; MINIO_DIR="$BACKUP_ROOT/minio-latest"; mkdir -p "$DB_DIR" "$MINIO_DIR"
for bin in pg_dump psql mc; do command -v "$bin" >/dev/null || { echo "Missing $bin" >&2; exit 1; }; done
RUN_ID="$(psql "$DATABASE_URL" -Atqc "insert into backup_runs(status) values('RUNNING') returning id")"
fail(){ code=$?; if [[ $code -ne 0 ]]; then psql "$DATABASE_URL" -c "update backup_runs set status='FAILED',error='backup exit ${code}',completed_at=now() where id='${RUN_ID}'" >/dev/null || true; fi; exit "$code"; }; trap fail EXIT
DB_FILE="$DB_DIR/pmmi-$STAMP.dump"
pg_dump "$DATABASE_URL" --format=custom --no-owner --no-acl --file="$DB_FILE"
mc alias set pmmi-source "$MINIO_ENDPOINT" "$MINIO_ACCESS_KEY" "$MINIO_SECRET_KEY" >/dev/null
mc mirror --overwrite "pmmi-source/$MINIO_BUCKET" "$MINIO_DIR/$MINIO_BUCKET"
find "$DB_DIR" -type f -name 'pmmi-*.dump' -mtime "+$RETENTION_DAYS" -delete
psql "$DATABASE_URL" -c "update backup_runs set status='SUCCEEDED',database_path='${DB_FILE//\'/\'\'}',object_storage_path='${MINIO_DIR//\'/\'\'}',completed_at=now() where id='${RUN_ID}'" >/dev/null
trap - EXIT
echo "PMMI backup complete: $RUN_ID"
