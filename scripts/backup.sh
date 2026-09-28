#!/bin/sh
# Daily backup: a pg_dump of the database + a tarball of the uploads volume.
# Run from the host, next to docker-compose.yml (see docs/deployment.md for the cron entry):
#   ./scripts/backup.sh [backup-dir]
#
# Optional off-server copy: set BACKUP_REMOTE to an rclone remote:path (e.g.
# "s3:my-bucket/aydin-autoglas-backups" or "b2:my-bucket/backups") and have `rclone config`
# already set up for that remote — see docs/deployment.md § Backups. Local backups (and
# retention pruning) always happen regardless of whether BACKUP_REMOTE is set.
set -eu

BACKUP_DIR="${1:-./backups}"
TIMESTAMP="$(date -u +%Y-%m-%dT%H-%M-%SZ)"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"
REMOTE="${BACKUP_REMOTE:-}"

mkdir -p "$BACKUP_DIR"

echo "[backup] Dumping database..."
docker compose exec -T postgres pg_dump -U app -Fc aydin_autoglas > "$BACKUP_DIR/db-$TIMESTAMP.dump"

echo "[backup] Archiving uploads..."
docker run --rm \
  -v "$(basename "$(pwd)")_uploads:/uploads:ro" \
  -v "$(cd "$BACKUP_DIR" && pwd):/backup" \
  alpine tar czf "/backup/uploads-$TIMESTAMP.tar.gz" -C / uploads

echo "[backup] Pruning local backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -name 'db-*.dump' -mtime "+$RETENTION_DAYS" -delete
find "$BACKUP_DIR" -name 'uploads-*.tar.gz' -mtime "+$RETENTION_DAYS" -delete

if [ -n "$REMOTE" ]; then
  if ! command -v rclone >/dev/null 2>&1; then
    echo "[backup] BACKUP_REMOTE is set to '$REMOTE' but rclone is not installed — skipping" \
      "off-server upload. Install it (see docs/deployment.md) to enable this." >&2
  else
    echo "[backup] Uploading this run's backup files to $REMOTE..."
    rclone copy "$BACKUP_DIR/db-$TIMESTAMP.dump" "$REMOTE/"
    rclone copy "$BACKUP_DIR/uploads-$TIMESTAMP.tar.gz" "$REMOTE/"

    echo "[backup] Pruning remote backups older than $RETENTION_DAYS days..."
    rclone delete --min-age "${RETENTION_DAYS}d" "$REMOTE/" --include 'db-*.dump'
    rclone delete --min-age "${RETENTION_DAYS}d" "$REMOTE/" --include 'uploads-*.tar.gz'
  fi
else
  echo "[backup] BACKUP_REMOTE not set — skipping off-server upload (backups stay local only)."
fi

echo "[backup] Done: $BACKUP_DIR/db-$TIMESTAMP.dump, $BACKUP_DIR/uploads-$TIMESTAMP.tar.gz"
