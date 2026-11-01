# Contributing

Use the Rust toolchain and Node version declared in `rust-toolchain.toml` and `.nvmrc`. Run `npm ci` and `npm --prefix frontend ci`. Preserve the reference HTML/inventories when changing compatibility behavior.

Before submitting:

```sh
cargo fmt --manifest-path backend/Cargo.toml --all -- --check
npm run build
npm run test:unit
```

Update the typed declarations in `backend/src/schema/manifest.json` for database changes. The autonomous synchronizer applies additions and rejects incompatible existing definitions; it does not maintain migration files or versions. Test fresh creation, idempotence, additive repair, mismatch rollback and append-only persistence against isolated PostgreSQL 16 databases. Include updated `backend/.sqlx` metadata if checked queries change.

Run mutation API/browser suites sequentially against a separate test instance. Do not use a live company database as a fixture. Exclude `.env`, dumps, employee exports, browser traces, generated reports and local tool state from commits.

Describe the resulting behavior, relevant validation and remaining limitations in the pull request.
