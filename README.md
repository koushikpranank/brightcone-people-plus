# Brightcone People Plus

A full-stack HR portal covering employee records, recruiting, onboarding, attendance, payroll, expenses, performance, learning and offboarding. Runs natively with **PostgreSQL 16**; Docker is not required.

The frontend uses TypeScript, Vite and Tailwind CSS. The backend uses Rust, Loco and Tokio. **SeaORM 2.0.4 owns database connections and autonomous schema synchronization**; existing checked SQLx business queries share its PostgreSQL pool.

## Features

- Nine application areas, 104 supplied views and 52 HR registers.
- Six server-enforced roles: HR Admin, HR Executive, Manager, Finance, Leadership and Employee.
- Employee identity creation, onboarding, approvals, attendance, career changes and exit access revocation.
- Editable company and employee salary components, payroll inputs and settlement parameters.
- Recorded payroll/settlement snapshots and policy revisions that retain their original values after later edits.
- Native development scripts, a portable release builder, Nginx/systemd examples and GitHub Actions CI.

## Quick start on Windows

Install PostgreSQL 16, PowerShell 7, Node.js (24 LTS recommended) and Rust 1.99.0. The database helper expects `C:\Program Files\PostgreSQL\16\bin`.

```powershell
git clone https://github.com/koushikpranank/brightcone-people-plus.git
cd brightcone-people-plus
npm ci
npm --prefix frontend ci
npm run db:setup
npm run db:sync
npm run dev
```

Open **http://127.0.0.1:5175**. The API uses **5155**; the project-local PostgreSQL cluster uses **55440**, database **brightcone_demo**, with the development login **postgres / postgres**.

`db:setup` creates the root `.env` with independent random signing secrets when it is missing. The actual `.env`, database files and backups remain local. Only environment templates are versioned. See [DATABASE.md](DATABASE.md) for pgAdmin and schema synchronization instructions.

## Use an existing PostgreSQL server

Copy `.env.example` to `.env`, set `DATABASE_URL` to a PostgreSQL 16 database you own, and replace both signing-secret placeholders with independent random values of at least 32 characters. Keep `PG*` values consistent when using psql. Install dependencies as above, then run `npm run dev`.

The backend synchronizes its declared schema on every startup and initializes the original sample company only when its company table is empty. Synchronization creates missing tables, columns, constraints and indexes without rewriting existing records. Incompatible definitions stop startup for review. Cross-platform manual commands:

```sh
cargo run --locked --manifest-path backend/Cargo.toml --bin brightcone-schema -- sync
cargo run --locked --manifest-path backend/Cargo.toml --bin brightcone-schema -- status
cargo run --locked --manifest-path backend/Cargo.toml --bin brightcone-schema -- verify
```

## Demonstration sign-ins

- HR Admin: `ananya.rao@brightcone.ai` / `Admin@123`
- Employee: `rahul.varma@brightcone.ai` / `Welcome@123`
- Other supplied employees: their supplied email / `Welcome@123`

These are sample website credentials, not database logins. Initialize a hosted instance privately and replace/remove sample accounts before employee access; see [DEPLOYMENT.md](DEPLOYMENT.md).

## Adjustable payroll

HR Admin opens **Settings & permissions > Money calculations**, also available from Payroll. Edit earnings, employee deductions and employer costs using fixed amounts, percentages of monthly CTC/Basic/gross, taxable CTC or a remaining-CTC earning. Company defaults can be overridden for an individual employee.

One-time bonus, incentive, reimbursement, recovery and deduction inputs affect recorded payroll. Included approved expenses become Paid. Final settlement uses explicit worked days, leave days, reimbursements and recoveries plus editable policy parameters. Monetary results are rounded to two decimal places.

`public.money_runs` retains inputs, results and the policy used; `public.money_policy_history` records policy revisions. Later edits do not rewrite saved runs. Recording payment status does not execute a bank transfer. Rates and tax treatment must be approved by the organization's HR/finance team.

## Build and deployment

```sh
npm run build:release
```

Creates `dist/brightcone/` with the compiled frontend, both Rust binaries, runtime configuration, deployment templates and a binary checksum manifest. Build on the target OS/architecture. No real `.env` or database is packaged.

Follow [DEPLOYMENT.md](DEPLOYMENT.md) for native PostgreSQL 16, a systemd API service and Nginx. The manually dispatched **Build native release** workflow produces an Ubuntu package. This repository does not automatically deploy to a server.

`GET /api/health` returns `{"status":"ok"}` after a successful database check.

## Validation

```sh
npm run build
npm run test:unit
cargo fmt --manifest-path backend/Cargo.toml --all -- --check
```

Against isolated running test instances:

```powershell
$env:TEST_API_URL='http://127.0.0.1:5156/api'
npm run test:api
$env:PLAYWRIGHT_BASE_URL='http://127.0.0.1:5176'
npm run test:e2e
```

The browser suite uses installed Chrome. If needed, install it with `frontend/node_modules/.bin/playwright install chrome`. Run mutation suites sequentially on a separate database: they create records and temporarily change demo accounts.

Coverage includes 25 Rust business/money tests, 52 register CRUD/archive/restore paths, 66 role/area combinations and four browser tests covering the supplied views and principal interactions. Additional scripts exercise shared dialogs, demo-table CRUD, custom money endpoints and a fictional complete employee lifecycle.

Schema integration tests in `backend/tests/schema.rs` are ignored by default because they require explicitly configured isolated databases. CI tests fresh creation, repeated/concurrent startup, missing-object repair, incompatible-schema rollback and database-enforced append-only history. The adoption case uses a restored local lifecycle fixture and verifies every business row, including account hashes and recorded money.

## Source layout

```text
backend/config/       Loco runtime configuration
backend/src/schema/  Autonomous synchronizer and typed table manifest
backend/src/          API, business services, models and seed data
backend/tests/        Business and money tests
backend/.sqlx/        Required offline query metadata
frontend/src/         TypeScript SPA, views and shared renderer
frontend/public/      Application assets
frontend/tests/       Browser tests
deploy/linux/         Nginx and systemd examples
scripts/              Development, build, schema and test utilities
specification/        Reference HTML and extracted inventories
.github/workflows/    CI and native release packaging
```

The supplied reference contains 14 employees, 104 view functions, 52 registers and eight rule definitions. Source shapes are retained as JSONB with typed/generated SQL projections across 113 application tables and 1,395 columns, plus two audit views.

Use PostgreSQL `pg_dump`/`pg_restore` for complete backups. The portal's live-register JSON import/export is append-only and is not a full backup of accounts, policy history or the money ledger. Database dumps, recordings, reports and local assistant/editor state are excluded from Git.

The original HTML, checksum, inventories and source generators are retained. `generate-runtime.mjs` regenerates the compatibility renderer; `generate-schema.mjs` updates transport metadata/types. Database declarations live in `backend/src/schema/manifest.json`. Additive changes are synchronized at startup; type/default/nullability changes require explicit database review. There is no migration crate, version sequence or migration history. Audit and money-history tables reject update/delete/truncate; the UI displays the latest 500 audit events while PostgreSQL retains the full history.

## Current limits

The shared renderer retains `@ts-nocheck` and some presentation logic. The API client, bridge, router, money editor and domain interfaces use strict TypeScript. Tests establish the named cases, not every input or production workload.

File fields store references/filenames. External email, SSO, bank payments, insurer/statutory delivery and general binary document storage are not configured. Forgot-password and SSO preserve the original demonstration behavior and do not provide external account recovery or identity integration.
