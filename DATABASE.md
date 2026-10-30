# PostgreSQL 16 and SeaORM

The actual development configuration is **`.env` in the project root**. Create it with `npm run db:setup`, or copy `.env.example`. It is intentionally excluded from Git; no second backend environment file is needed.

The Windows native helper uses these local defaults:

```dotenv
DATABASE_URL=postgres://postgres:postgres@127.0.0.1:55440/brightcone_demo
PGHOST=127.0.0.1
PGPORT=55440
PGDATABASE=brightcone_demo
PGUSER=postgres
PGPASSWORD=postgres
```

The development database username and password are both `postgres`. Website sign-ins are separate. Deployment requires server-specific credentials and independent signing secrets; see [DEPLOYMENT.md](DEPLOYMENT.md).

## View in pgAdmin

Register **Brightcone PostgreSQL 16** with host `127.0.0.1`, port **55440**, maintenance database `brightcone_demo`, username `postgres` and password `postgres`.

Alternatively, import [pgadmin-server.json](pgadmin-server.json) through **Tools > Import/Export Servers**, then enter the password when connecting. Use **55440**; port `5432` may be another local PostgreSQL installation.

Expand **Databases > brightcone_demo > Schemas**:

- `demo`: portal employee/company state and demonstration registers.
- `live`: 52 HR registers plus supporting responses, settings and audit tables.
- `public`: sessions, app metadata, response deduplication, money snapshots, policy history and SeaORM history.

```sql
SELECT current_database(), current_user, version();
SELECT * FROM public.seaql_migrations;
SELECT id, record FROM demo.employees ORDER BY position;
SELECT id, record FROM live.emp ORDER BY position;
SELECT id, kind, employee_id, period, policy_revision, record
FROM public.money_runs ORDER BY created_at;
```

## Commands

PowerShell 7:

```powershell
npm run db:setup
npm run db:migrate
npm run db:status
npm run db:verify
```

Cross-platform:

```sh
cargo run --locked --manifest-path backend/Cargo.toml -p brightcone-migration -- up
cargo run --locked --manifest-path backend/Cargo.toml -p brightcone-migration -- status
cargo run --locked --manifest-path backend/Cargo.toml -p brightcone-migration -- verify
```

Startup also applies pending migrations and seeds the sample company only when the company table is empty.

## Schema ownership

The `backend/migration/` crate uses **sea-orm 2.0.4** and **sea-orm-migration 2.0.4**. Its Rust baseline creates/adopts 113 application tables, 1,395 columns and two audit views. `schema.json` is frozen metadata describing types, generated expressions, constraints, indexes and defaults; it contains no employee record values.

SeaORM owns the connection and migration lifecycle. Existing checked SQLx business queries share its PostgreSQL pool; they have not all been rewritten as SeaORM entities. Keep `backend/.sqlx` in Git: it allows checked-query compilation without a live database.

The old SQL-file runner is replaced. SeaORM writes `public.seaql_migrations`. Existing schemas are verified before the old `_sqlx_migrations` bookkeeping is retired in the same advisory-locked transaction. Business records, account hashes and money history are retained. A schema mismatch aborts adoption. The helper exposes no destructive reset command.

The native helper stores its development cluster under `.local/postgres-native/`. Dumps, adoption fixtures and lifecycle evidence stay outside Git. Use complete PostgreSQL backups before migrating real HR data; the UI register export is not a full restore backup.

Add new Rust migrations for later changes; do not regenerate/edit the applied baseline. See [SeaORM migration documentation](https://www.sea-ql.org/SeaORM/docs/migration/writing-migration/).
