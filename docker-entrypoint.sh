#!/bin/sh
set -e

echo "Running database migrations..."
node_modules/.bin/tsx server/db/migrate.ts

exec "$@"
