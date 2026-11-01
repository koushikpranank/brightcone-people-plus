# Native deployment

Run PostgreSQL 16, the Rust API and Nginx serving the compiled frontend. Docker is not required. The example targets Ubuntu 24.04 with systemd. Build on the operating system/architecture where the package will run.

## Build

Install Rust 1.99.0 and Node.js 24 LTS. The repository declares these toolchains through `rust-toolchain.toml` and `.nvmrc`. Install the native prerequisites:

```sh
sudo apt update
sudo apt install -y build-essential pkg-config libssl-dev ca-certificates git nginx postgresql-16 postgresql-client-16
git clone https://github.com/koushikpranank/brightcone-people-plus.git
cd brightcone-people-plus
npm ci
npm run build:release
```

If PostgreSQL 16 is unavailable in your distribution, configure the [official PostgreSQL Ubuntu repository](https://www.postgresql.org/download/linux/ubuntu/) and install the version-16 packages explicitly. Node and Rust must be installed separately before building.

The package is `dist/brightcone/`: two binaries under `bin/`, runtime `backend/config/production.yaml`, compiled `frontend/`, deployment templates, documentation and `release-manifest.json`. No actual `.env`, database or recordings are included. Windows executables cannot run on Linux. Alternatively, dispatch **Build native release** in GitHub Actions and download its Ubuntu package.

## Create the database

Use a dedicated role/database. In `sudo -u postgres psql`:

```sql
CREATE ROLE brightcone LOGIN;
\password brightcone
CREATE DATABASE brightcone OWNER brightcone;
```

Enter a strong server-specific password at the prompt. The role owns the database and can create the schemas/tables/indexes required by SeaORM. Keep PostgreSQL on a private/local interface. The development `postgres/postgres` defaults are not the production connection.

For a remote database, use the provider's PostgreSQL 16 connection URL and TLS settings. URL-encode reserved characters in a password used in `DATABASE_URL`.

## Install a versioned release

For the first installation, choose a release name such as `2026-10-30-1`:

```sh
sudo useradd --system --user-group --home-dir /opt/brightcone --shell /usr/sbin/nologin brightcone
sudo install -d -m 755 /opt/brightcone/releases/2026-10-30-1
sudo cp -a dist/brightcone/. /opt/brightcone/releases/2026-10-30-1/
sudo chmod 755 /opt/brightcone/releases/2026-10-30-1/bin/brightcone-people-plus /opt/brightcone/releases/2026-10-30-1/bin/brightcone-schema
sudo ln -s /opt/brightcone/releases/2026-10-30-1 /opt/brightcone/current
sudo install -d -m 750 -o root -g brightcone /etc/brightcone
sudo install -m 640 -o root -g brightcone .env.production.example /etc/brightcone/brightcone.env
```

If the service user or `current` symlink already exists, follow the upgrade procedure instead of recreating them.

Edit `/etc/brightcone/brightcone.env` with the real database URL, domain in `APP_URL`, and independent `JWT_SECRET`/`SESSION_SECRET` values. Generate each signing secret separately, for example with `openssl rand -hex 32`. Replace every placeholder. `PORT=5150` matches the Nginx template. Use plain `KEY=value` entries without shell commands or inline comments.

## Start the API privately

```sh
sudo install -m 644 deploy/linux/brightcone.service /etc/systemd/system/brightcone.service
sudo systemctl daemon-reload
sudo systemctl enable --now brightcone
sudo systemctl status brightcone
curl --fail http://127.0.0.1:5150/api/health
```

Expected response: `{"status":"ok"}`. This checks database connectivity as well as the listener. Logs are available with `journalctl -u brightcone -f`.

Startup runs the manifest-driven autonomous schema synchronizer in one advisory-locked transaction and seeds sample company data only if the company table is empty. The binary must run from the packaged `backend/` directory to find Loco's `config/`; the supplied service sets it. `LOCO_ENV=production` selects the production configuration, following [Loco's deployment guidance](https://loco.rs/docs/how-to/deploy/). The API remains on loopback; Nginx is the public entry point.

## Frontend and HTTPS

Initialize in private staging and replace/remove the documented sample accounts before public employee access. A fresh database contains the sample company/passwords listed in the README; use the existing account management and password controls. If restoring a prepared full database backup instead, verify its users and company data before exposure.

Copy `deploy/linux/nginx.conf` into `/etc/nginx/sites-available/brightcone`, replace `hr.example.com` with your domain and enable it using your normal Nginx site-management process. It serves `/opt/brightcone/current/frontend`, proxies `/api/` unchanged to port 5150 and falls back to `index.html` for nested SPA routes.

```sh
sudo nginx -t
sudo systemctl reload nginx
```

Configure a valid HTTPS certificate and redirect HTTP to HTTPS before using real employee accounts. Keep API/database ports private. The committed HTTP server block is a starting template, not a provisioned certificate or domain. The forwarded headers follow [Nginx proxy documentation](https://nginx.org/en/docs/http/ngx_http_proxy_module.html).

```sh
curl --fail https://hr.example.com/api/health
curl --head https://hr.example.com/login
```

Verify administrator sign-in, a saved record, refreshing a nested route and a salary preview. Do not run mutation integration tests against a live company database.

## Backups, upgrades and rollback

Back up the complete PostgreSQL database before replacing a release/applying schema changes. Supply credentials through a protected `.pgpass` file or environment rather than a password argument:

```sh
pg_dump --host=127.0.0.1 --username=brightcone --dbname=brightcone --format=custom --file=brightcone-before-upgrade.dump
```

Store backups outside the release directory and test `pg_restore` into a separate database. The UI register JSON backup does not include the full money ledger, policy history or account credentials.

Install each new build into a new `/opt/brightcone/releases/<version>/` directory and retain the existing server environment file. Stop the service, replace `current` with a symlink to the new release and restart. The autonomous synchronizer creates missing schema objects and validates existing definitions at startup. Incompatible types, nullability, defaults, expressions or declared indexes stop startup for DBA review. Check health, sign-in and critical workflows before retiring the previous build/backup.

A binary rollback requires a compatible database. There is no versioned migration/down/reset command. The synchronizer never drops business tables or columns; use a reviewed manual database change or tested restore procedure when a schema rollback is required.

## Other options and limits

`npm run start:production` starts a locally built package for verification. `ENV_FILE` chooses a configuration file, `RELEASE_DIR` chooses the package and process environment values take precedence. This starts the API only; the frontend still needs a static server/reverse proxy.

The long-running service template is Linux systemd, not a Windows service definition. External email, SSO, bank transfer, insurer/statutory delivery and general binary document storage are not configured. Payment status is a saved workflow value. Review the application limits and HR calculation policies before production use. These files prepare deployment; they do not create a hosted service.
