#!/usr/bin/env sh
# Database backup — runs inside the backup container
# Dumps PostgreSQL → gzip → uploads to Arvan Cloud S3 → prunes old backups
# awscli is installed by the container entrypoint before this script runs
set -e

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILENAME="football_${TIMESTAMP}.sql.gz"
BACKUP_DIR="/tmp/backups"

mkdir -p "$BACKUP_DIR"

echo "[$(date)] Starting backup: $FILENAME"

# 1. Dump (custom format is compressed + restorable with pg_restore)
pg_dump -h postgres -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  --format=custom --no-owner --no-acl \
  | gzip > "${BACKUP_DIR}/${FILENAME}"

echo "[$(date)] Dump complete ($(du -sh "${BACKUP_DIR}/${FILENAME}" | cut -f1))"

# 2. Upload to S3 (Arvan Cloud endpoint)
aws s3 cp \
  "${BACKUP_DIR}/${FILENAME}" \
  "s3://${S3_BUCKET}/${FILENAME}" \
  --endpoint-url "${S3_ENDPOINT}" \
  --region "${S3_REGION:-ir-thr-at1}"

echo "[$(date)] Uploaded to s3://${S3_BUCKET}/${FILENAME}"

# 3. Prune backups older than 30 days
CUTOFF=$(date -d "30 days ago" +%Y%m%d 2>/dev/null || date -v-30d +%Y%m%d)
aws s3 ls "s3://${S3_BUCKET}/" \
  --endpoint-url "${S3_ENDPOINT}" \
  | awk '{print $4}' \
  | while read -r key; do
      FDATE=$(echo "$key" | grep -oE '[0-9]{8}' | head -1)
      if [ -n "$FDATE" ] && [ "$FDATE" -lt "$CUTOFF" ]; then
        aws s3 rm "s3://${S3_BUCKET}/${key}" --endpoint-url "${S3_ENDPOINT}"
        echo "[$(date)] Pruned old backup: $key"
      fi
    done

# 4. Cleanup local temp file
rm -f "${BACKUP_DIR}/${FILENAME}"

echo "[$(date)] Backup complete: ${FILENAME}"
