#!/bin/sh
# Restores a database dump and/or an uploads tarball produced by scripts/backup.sh.
# DESTRUCTIVE: drops and recreates the database content. Stop the app first.
#   ./scripts/restore.sh backups/db-2026-01-01T00-00-00Z.dump [backups/uploads-2026-01-01T00-00-00Z.tar.gz]
set -eu

DB_DUMP="${1:?Usage: restore.sh <db-dump-file> [uploads-tarball]}"
UPLOADS_TARBALL="${2:-}"

echo "[restore] Stopping the app (keeping postgres up)..."
docker compose stop app

echo "[restore] Restoring database from $DB_DUMP (existing data will be dropped)..."
docker compose exec -T postgres dropdb -U app --if-exists aydin_autoglas
docker compose exec -T postgres createdb -U app aydin_autoglas
docker compose exec -T postgres pg_restore -U app -d aydin_autoglas --no-owner < "$DB_DUMP"

if [ -n "$UPLOADS_TARBALL" ]; then
  echo "[restore] Restoring uploads from $UPLOADS_TARBALL..."
  docker run --rm \
    -v "$(basename "$(pwd)")_uploads:/uploads" \
    -v "$(cd "$(dirname "$UPLOADS_TARBALL")" && pwd):/backup" \
    alpine sh -c "rm -rf /uploads/* && tar xzf /backup/$(basename "$UPLOADS_TARBALL") -C /"
fi

echo "[restore] Restarting the app..."
docker compose up -d app

echo "[restore] Done. Check: curl http://localhost:3000/api/health"
