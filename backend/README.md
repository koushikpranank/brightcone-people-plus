# Native Loco backend

See [the project README](../README.md) for setup, demo accounts, schema synchronization, and tests. Run commands from this directory so Loco finds `config/`:

```powershell
cargo run -- start
cargo test --test business
cargo build --release
```

The application uses Loco `Hooks` with a SeaORM 2.0.4 PostgreSQL connection. Startup runs `schema::run_autonomous_sync` against the typed manifest, creates missing objects, validates existing definitions and seeds only an empty demo company. All schema changes commit together or roll back; no migration files, versions or history are used. Existing checked SQLx business queries share SeaORM's pool. Request values use bind parameters.

The actual `.env` belongs in the project root and is excluded from Git. Local defaults: PostgreSQL 16, `127.0.0.1:55440`, database `brightcone_demo`, username `postgres`, password `postgres`. See [DATABASE.md](../DATABASE.md) for pgAdmin and [DEPLOYMENT.md](../DEPLOYMENT.md) for production configuration.

From this directory, synchronize or verify the declared schema:

```powershell
cargo run --bin brightcone-schema -- sync
cargo run --bin brightcone-schema -- status
cargo run --bin brightcone-schema -- verify
```
