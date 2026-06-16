#!/usr/bin/env bash
# Restore a specific database backup from S3
# Usage: bash scripts/db-restore.sh football_20260612_030000.sql.gz
#
# Prerequisites on the host:
#   - awscli installed (brew/apt)
#   - S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY, S3_BUCKET env vars set
#   - POSTGRES_USER, POSTGRES_DB, POSTGRES_PASSWORD env vars set
#   - docker compose -f docker/docker-compose.prod.yml is accessible
set -euo pipefail

FILENAME="${1:?Usage: db-restore.sh <backup-filename.sql.gz>}"
S3_ENDPOINT="${S3_ENDPOINT:?S3_ENDPOINT env var required}"
S3_BUCKET="${S3_BUCKET:?S3_BUCKET env var required}-backups"
POSTGRES_USER="${POSTGRES_USER:-football}"
POSTGRES_DB="${POSTGRES_DB:-football}"
TMP_FILE="/tmp/${FILENAME}"

echo "[$(date)] Downloading s3://${S3_BUCKET}/${FILENAME}..."
aws s3 cp "s3://${S3_BUCKET}/${FILENAME}" "$TMP_FILE" --endpoint-url "$S3_ENDPOINT"

echo "[$(date)] Restoring to database ${POSTGRES_DB}..."

# pg_restore via docker exec — drops all objects and recreates from backup
gunzip -c "$TMP_FILE" | \
  docker compose -f docker/docker-compose.prod.yml exec -T postgres \
    pg_restore \
      --username="$POSTGRES_USER" \
      --dbname="$POSTGRES_DB" \
      --clean \
      --if-exists \
      --no-owner \
      --no-acl \
      --format=custom

rm -f "$TMP_FILE"
echo "[$(date)] Restore complete from $FILENAME"
