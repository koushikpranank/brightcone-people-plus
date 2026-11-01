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
- `public`: sessions, app metadata, response deduplication, money snapshots, policy history and database-enforced append-only history.

```sql
SELECT current_database(), current_user, version();
SELECT table_schema, table_name FROM information_schema.tables
WHERE table_schema IN ('demo','live') ORDER BY table_schema,table_name;
SELECT id, record FROM demo.employees ORDER BY position;
SELECT id, record FROM live.emp ORDER BY position;
SELECT id, kind, employee_id, period, policy_revision, record
FROM public.money_runs ORDER BY created_at;
```

## Commands

PowerShell 7:

```powershell
npm run db:setup
npm run db:sync
npm run db:status
npm run db:verify
```

Cross-platform:

```sh
cargo run --locked --manifest-path backend/Cargo.toml --bin brightcone-schema -- sync
cargo run --locked --manifest-path backend/Cargo.toml --bin brightcone-schema -- status
cargo run --locked --manifest-path backend/Cargo.toml --bin brightcone-schema -- verify
```

Startup automatically runs the same synchronizer before seeding or serving requests. Seeding occurs only when the company table is empty.

## Manifest-driven startup synchronization

`backend/src/schema/mod.rs` implements `run_autonomous_sync`, following the provided additive synchronization pattern. `manifest.rs` supplies typed `Column`, `ColumnType` and `Table` declarations loaded from `manifest.json`. The manifest describes this project's 113 application tables, 1,395 columns, constraints, indexes, generated expressions, defaults and two audit views; it contains no employee record values.

On every startup, one PostgreSQL transaction takes an advisory lock, inspects the schema by namespace and table, and creates missing objects. Existing columns are checked by name rather than physical order, so repaired columns and additional custom columns are supported. Existing type, nullability, identity, default, generated-expression, declared-constraint and index mismatches fail with a review message. The transaction rolls back all preceding additions on failure. Tables and business columns are never automatically dropped or converted.

The migration crate, versioned files and migration dependency are removed. After verification succeeds, obsolete `public.seaql_migrations` and `public._sqlx_migrations` bookkeeping tables are retired within the same transaction. No new migration history is created. `status`/`verify` inspect without changing the schema.

The supplied sample refers to another application's `users`, `hr_records` and normalized People/Time tables. This implementation applies its synchronization mechanism to this project's actual `demo`, `live` and money schemas, preserving the current API, IDs, roles and data instead of creating unused parallel tables.

## Append-only history

Database triggers reject UPDATE, DELETE and TRUNCATE on `demo.audit`, `live.audit`, `public.money_runs` and `public.money_policy_history`. Audit persistence inserts new rows rather than deleting/rebuilding old rows. The portal still loads its latest 500 audit events; older events remain stored in PostgreSQL. Business payroll and settlement snapshots retain their original amounts and policy.

SeaORM owns the connection. Existing checked SQLx business queries share its PostgreSQL pool; they have not all been rewritten as SeaORM entities. Keep `backend/.sqlx` in Git because it provides checked-query build metadata, not migrations.

## Verification and backups

The schema unit tests check the manifest and declaration safety. Opt-in PostgreSQL tests in `backend/tests/schema.rs` cover fresh creation, concurrent/repeated startup, missing-column/index/constraint repair, extra-column retention, incompatible-schema rollback, append-only audit/money protection and adoption of an existing HR database. Tests require explicit isolated `brightcone_schema_*` databases.

```powershell
$env:SCHEMA_TEST_DATABASE_URL='postgres://postgres:postgres@127.0.0.1:55440/brightcone_schema_test'
cargo test --manifest-path backend/Cargo.toml --test schema schema_sync_contract -- --ignored
```

Create the isolated database before running this test; do not point it at your company database. The optional existing-data test additionally uses `SCHEMA_UPGRADE_DATABASE_URL` for a restored lifecycle fixture.

The native helper stores its development cluster under `.local/postgres-native/`. Dumps and lifecycle evidence remain outside Git. Back up the complete PostgreSQL database before applying schema changes to real HR data. The UI register export is not a full restore backup. Incompatible destructive changes require a reviewed DBA change or restore procedure; there is no production reset helper.
