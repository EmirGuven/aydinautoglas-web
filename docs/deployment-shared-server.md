# Deployment on the shared server (same box as ev-mobil)

This is the **actual current deployment target** for aydin-autoglas-web: a server that already
runs other apps (currently `ev-mobil`) behind a shared Traefik reverse proxy, with a shared
PostgreSQL instance those apps connect to over an internal Docker network. Use this document
and `docker-compose.yml` (not `docker-compose.standalone.yml` / `docs/deployment.md`, which are
for a dedicated single-app server instead).

## What's already true about this server (established by the ev-mobil deployment)

- **Reverse proxy is Traefik**, not Caddy — it already owns host ports 80/443. This app must
  never try to bind those ports itself or it will conflict.
- **Two external Docker networks already exist** (created once, shared by every app on the box):
  - `proxy` — the network Traefik and every app's container join, so Traefik can route to it.
  - `livaisitme_internal` — the network the shared PostgreSQL container lives on.
- **PostgreSQL is one shared container**, not one-per-app. Each app gets its own database and
  role inside that same instance, not its own Postgres container.
- **Deploys are git-based**: a GitHub Actions workflow SSHes in as the `dev` user and does
  `git clone`/`git pull` + `docker compose up -d --build` directly on the server, under
  `/srv/docker/apps/<app-name>`.

## 1. One-time: create this app's database on the shared PostgreSQL instance

Run this **once**, on the server, against the shared Postgres container (find its container
name with `docker ps` — it's the one `ev-mobil`'s `docker-compose.yml` connects to on the
`livaisitme_internal` network):

```sh
docker exec -it <shared-postgres-container-name> psql -U postgres
```

Then, inside `psql` (replace `CHANGE_ME_STRONG_PASSWORD` with a real generated password —
`openssl rand -base64 24`, no shell-special characters if you'll paste it into a `.env` file
unquoted):

```sql
CREATE USER aydin_autoglas WITH PASSWORD 'CHANGE_ME_STRONG_PASSWORD';
CREATE DATABASE aydin_autoglas OWNER aydin_autoglas;
GRANT ALL PRIVILEGES ON DATABASE aydin_autoglas TO aydin_autoglas;
```

This gives aydin-autoglas-web its own isolated database and role inside the shared instance —
it can't see or touch `ev-mobil`'s (or any other app's) data, and vice versa.

## 2. One-time: server directory and `.env`

```sh
mkdir -p /srv/docker/apps/aydin-autoglas-web
```

Create `/srv/docker/apps/aydin-autoglas-web/.env` (this file is **not** in git — it's created
directly on the server and never touched by the deploy workflow):

```env
ADMIN_JWT_SECRET=<generate with: openssl rand -base64 48>
# Host is the shared Postgres container's name/service on the livaisitme_internal network
# (the same host ev-mobil's DATABASE_URL uses) — check ev-mobil's server-side .env if unsure,
# or `docker inspect` the shared postgres container's name on that network.
DATABASE_URL=postgresql://aydin_autoglas:CHANGE_ME_STRONG_PASSWORD@postgres:5432/aydin_autoglas
```

`docker-compose.yml` refuses to start without both of these set (`${VAR:?...}` syntax) —
that's deliberate, same as the standalone deployment's behavior.

## 3. One-time: DNS and GitHub

- Point `aydinautoglas.de` and `www.aydinautoglas.de`'s DNS `A`/`AAAA` records at the server's
  IP. Traefik's `letsencrypt` certresolver (already configured on this server, since ev-mobil
  uses it) issues the certificate automatically on first request once DNS resolves.
- Push this repository to `github.com/EmirGuven/aydin-autoglas-web` (adjust
  `.github/workflows/deploy.yml`'s `REPO` line if the actual owner/repo differs) — the server's
  SSH key or a deploy key needs read access to clone/pull it.
- In the GitHub repo's Settings → Secrets and variables → Actions, add:
  - `SERVER_IP` — the server's IP/hostname.
  - `SERVER_SSH_KEY` — a private key the `dev` user on the server accepts (same secret ev-mobil's
    workflow uses — reuse it, don't create a second one, unless you want per-app key rotation).

## 4. First deploy

Push to `main` — `.github/workflows/deploy.yml` runs automatically: clones/pulls into
`/srv/docker/apps/aydin-autoglas-web`, then `docker compose up -d --build`. This also runs
migrations automatically (`docker-entrypoint.sh` → `tsx server/db/migrate.ts`), same as the
standalone deployment.

Or trigger the first deploy manually before wiring CI, from your machine:

```sh
ssh dev@<server-ip>
mkdir -p /srv/docker/apps/aydin-autoglas-web && cd /srv/docker/apps/aydin-autoglas-web
git clone git@github.com:EmirGuven/aydin-autoglas-web.git .
# (create .env here as in step 2, if not already done)
docker compose up -d --build
```

## 5. Seed content and create the first admin

```sh
cd /srv/docker/apps/aydin-autoglas-web
docker compose exec app node_modules/.bin/tsx server/db/seed/run.ts --template=autoglass
docker compose exec app node_modules/.bin/tsx server/cli/create-admin.ts \
  --email=you@example.com --name="Your Name" --password="a long random password" --role=owner
```

## 6. Verify

```sh
curl -f http://127.0.0.1:3000/api/health          # from the server, container-internal check bypassed
docker compose ps                                  # both healthcheck states should read healthy
curl -I https://aydinautoglas.de                    # Traefik + TLS
curl -I https://www.aydinautoglas.de
docker compose logs -f app                          # tail logs if anything looks wrong
```

## Backups

`scripts/backup.sh` (Phase 10, extended post-launch with optional `rclone` off-server upload —
see `docs/decisions.md` ADR list) was written assuming this app owns its Postgres container
(`docker compose exec postgres pg_dump ...`). On the shared server, back up this app's database
the same way `ev-mobil`'s own backup script does — `pg_dump` against the shared container,
scoped to just this app's database:

```sh
docker exec <shared-postgres-container-name> pg_dump -U aydin_autoglas -Fc aydin_autoglas > aydin-autoglas-$(date +%Y%m%d-%H%M%S).dump
```

Uploads still live in this app's own `uploads` named Docker volume (`docker volume inspect
aydin-autoglas-web_uploads` for its actual path) — back that up the same way `scripts/backup.sh`
already does for the standalone deployment, or adapt it to call `pg_dump` against the shared
container instead of `docker compose exec postgres` if you want one script to cover both. Not
yet done in this pass — a real follow-up, not a silent gap: `scripts/backup.sh` as it stands
today only works against `docker-compose.standalone.yml`.

## What's deliberately different from the standalone deployment

- No bundled Postgres container, no bundled Caddy — both come from the shared server
  infrastructure instead (see ADR list in `docs/decisions.md` for why `docker-compose.yml` was
  restructured around this).
- No `ports:` mapping on the `app` service — Traefik reaches it purely over the `proxy` Docker
  network, so port 3000 is never exposed on the host at all (this also sidesteps the
  `[::1]:3000` stale-process gotcha from local dev entirely in production).
- Compression (ADR-0013's gap) is closed via a Traefik `compress` middleware label on this app's
  own router, not via Caddy.
