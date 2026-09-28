# Deployment (Hetzner, Docker) — standalone, dedicated-server scenario

**If this app is being deployed alongside other apps on a shared server** (a Traefik reverse
proxy already running, a shared PostgreSQL instance other apps also use), use
`docs/deployment-shared-server.md` and `docker-compose.yml` instead — that's the actual current
deployment target for aydin-autoglas-web. This document describes the original,
self-contained-single-server scenario from prompt.md §10 and uses `docker-compose.standalone.yml`
(bundled PostgreSQL, optional bundled Caddy) — kept for when this app is ever deployed on its
own dedicated box instead.

Everything below assumes a fresh Hetzner Cloud VPS (a CX22 or larger is plenty for this app —
it's a single Node process + Postgres, not a fleet) running Ubuntu 24.04, and a domain whose
DNS you control. No git repository exists for this project yet (see CLAUDE.md) — deploy by
copying the working directory to the server, e.g. `rsync` or `scp`, or via a git remote once
one exists.

## 1. Server setup

```sh
# On the Hetzner server, as root (or a sudo user):
apt update && apt upgrade -y
apt install -y docker.io docker-compose-plugin ufw

# Firewall: only SSH, HTTP, HTTPS
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# Non-root user to run the app under (avoid running docker as root day-to-day)
adduser deploy
usermod -aG docker deploy
```

Point your domain's DNS `A`/`AAAA` records at the server's IP before continuing — Caddy's
automatic HTTPS (step 4) needs the domain to already resolve to this server to issue a
certificate.

## 2. Copy the project and configure environment

```sh
# As the deploy user, from your local machine:
rsync -avz --exclude node_modules --exclude .output --exclude .nuxt \
  ./ deploy@YOUR_SERVER_IP:/home/deploy/aydin-autoglas-web/

# On the server:
cd /home/deploy/aydin-autoglas-web
cp .env.example .env
```

Edit `.env` and set real values:
- `ADMIN_JWT_SECRET` — generate with `openssl rand -base64 48`. Never reuse the dev value.
- `DATABASE_URL` — leave as-is; `docker-compose.standalone.yml` overrides it to point at the
  `postgres` service by container name, so this value only matters if you ever run the app
  outside Docker.
- `SMTP_*` — real SMTP credentials, or leave blank (form submissions still succeed; see
  CLAUDE.md's Phase 6 notes — email sending just no-ops with a console warning until set).
- `TURNSTILE_*` — only if Cloudflare Turnstile is enabled from Settings → Forms.

`docker-compose.standalone.yml` reads `ADMIN_JWT_SECRET` from the shell/`.env` at
`docker compose up` time (`${ADMIN_JWT_SECRET:?...}` — it refuses to start without one, on
purpose).

## 3. Point the reverse proxy at your domain

Edit `Caddyfile` in the project root: replace `example.com, www.example.com` with your real
domain(s), and `admin@example.com` with a real address (used only for Let's Encrypt expiry
notices).

## 4. Bring the stack up

```sh
docker compose -f docker-compose.standalone.yml --profile proxy up --build -d
```

This builds the app image, starts Postgres (with a healthcheck gate so the app doesn't start
before the database is ready), runs migrations automatically
(`docker-entrypoint.sh` → `tsx server/db/migrate.ts`), and starts Caddy in front of the app on
80/443 with automatic HTTPS. Without `--profile proxy`, only `postgres` + `app` start, exposed
on host port 3000 with no TLS — fine for a quick internal check, not for production traffic.

Verify:

```sh
curl https://your-domain.com/api/health
# {"status":"ok","db":"ok"}
```

## 5. Seed content and create the first admin

```sh
# Pick the sector template that matches this deployment:
docker compose -f docker-compose.standalone.yml exec app node_modules/.bin/tsx server/db/seed/run.ts --template=autoglass

# First admin login (owner role — can create other users/apply templates from here on):
docker compose -f docker-compose.standalone.yml exec app node_modules/.bin/tsx server/cli/create-admin.ts \
  --email=you@example.com --name="Your Name" --password="a long random password" --role=owner
```

(`pnpm db:seed`/`pnpm admin:create` are the same commands via the `package.json` scripts —
either form works; `node_modules/.bin/tsx` is what's actually available inside the container,
since it doesn't have `pnpm` installed. See CLAUDE.md's Phase 8 Docker gotcha if this fails
with a module-not-found error after adding a *new* seed template that imports from a server
subdirectory not yet copied into the Dockerfile's `production` stage.)

Once real company content exists, log in at `https://your-domain.com/admin` and review every
seeded field (`server/db/seed/templates/autoglass.ts`'s doc comment lists exactly what's
placeholder) — company name, address, phone, legal pages (Impressum/Datenschutz), and the
service/branch content are all meant to be replaced with the real business's actual details.

## 6. Backups

```sh
# One-off, or add to cron (see below):
./scripts/backup.sh /home/deploy/backups
```

Dumps the database (`pg_dump -Fc`, Postgres's custom compressed format) and archives the
`uploads` Docker volume, both timestamped, into the given directory (default `./backups`).
Old backups beyond `BACKUP_RETENTION_DAYS` (default 14) are pruned automatically. Restore with:

```sh
./scripts/restore.sh /home/deploy/backups/db-<timestamp>.dump /home/deploy/backups/uploads-<timestamp>.tar.gz
```

**This is destructive** — it stops the app, drops and recreates the database, and (if an
uploads tarball is given) wipes the uploads volume before restoring. It does not ask for
confirmation; only run it deliberately.

Daily cron entry (as the `deploy` user, `crontab -e`):

```
0 3 * * * cd /home/deploy/aydin-autoglas-web && ./scripts/backup.sh /home/deploy/backups >> /home/deploy/backups/backup.log 2>&1
```

### Off-server upload (recommended)

Backups sitting only on the same disk as the database don't protect against disk failure or a
compromised server — copy them off-server. `scripts/backup.sh` can do this automatically via
[`rclone`](https://rclone.org) (supports S3, Backblaze B2, Hetzner Object Storage, and dozens of
other backends through one tool):

```sh
# One-time setup, as the deploy user:
curl https://rclone.org/install.sh | sudo bash
rclone config   # interactive — pick your storage provider, name the remote e.g. "backupstore"
```

Then set `BACKUP_REMOTE` in `.env` to `remote-name:bucket/path` (e.g.
`backupstore:my-bucket/aydin-autoglas-backups`) and export it to the cron job's environment —
either by adding `set -a; . /home/deploy/aydin-autoglas-web/.env; set +a &&` before the
`./scripts/backup.sh` call in the crontab line, or by setting `BACKUP_REMOTE=...` directly in
the crontab above the job line. Each run then uploads that run's `db-*.dump` and
`uploads-*.tar.gz` to the remote and prunes remote copies older than `BACKUP_RETENTION_DAYS`,
in addition to the existing local copy and local pruning. Leaving `BACKUP_REMOTE` unset keeps
the previous local-only behavior — `rclone` isn't required unless you set it.

## 7. Deploying an update

```sh
# On the server, after rsync-ing the updated project files:
docker compose -f docker-compose.standalone.yml --profile proxy up --build -d
```

Rebuilds only the `app` image (Postgres and Caddy are unaffected unless their own config
changed) and recreates the `app` container; migrations run again automatically on start
(Drizzle migrations are additive and idempotent — already-applied ones are skipped). Postgres
data and uploads persist in their named volumes across this.

## 8. Monitoring the basics

- `docker compose -f docker-compose.standalone.yml logs -f app` — application logs.
- `docker compose -f docker-compose.standalone.yml ps` — container health (Postgres has a real healthcheck; the app doesn't yet
  have a Docker-level healthcheck beyond `/api/health` being reachable — add one to
  `docker-compose.standalone.yml` if you want `docker compose -f docker-compose.standalone.yml ps` itself to reflect app health, not just
  "running").
- Caddy's access log is written to the `caddy_data` volume at `/data/access.log` inside the
  container (see the `Caddyfile`) — `docker compose -f docker-compose.standalone.yml exec caddy cat /data/access.log`.

## What's still a known gap (see CLAUDE.md / docs/decisions.md for detail)

- Mobile Lighthouse Performance measured 80/100 against a bare container (ADR-0013) — re-run
  it against this real Caddy-fronted deployment once it's live; Caddy's automatic gzip/zstd
  compression should close most of the remaining gap, but that's a prediction, not yet a
  measurement against this specific deployment.
- No centralized error/log aggregation (Sentry, a log shipper, etc.) — `docker compose logs`
  only, which is fine for a single-server deployment but won't survive the container being
  recreated.
