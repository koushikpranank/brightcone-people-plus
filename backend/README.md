# Native Loco backend

See [the project README](../README.md) for setup, demo accounts, migration, and tests. Run commands from this directory so Loco finds `config/`:

```powershell
cargo run -- start
cargo test --test business
cargo build --release
```

The application uses Loco `Hooks` with a SeaORM 2.0.4 PostgreSQL connection. Startup applies the Rust migrations from `migration/`, verifies/adopts the existing schema and seeds only an empty demo company. Existing checked SQLx business queries share SeaORM's pool. Request values use bind parameters.

The actual `.env` belongs in the project root and is excluded from Git. Local defaults: PostgreSQL 16, `127.0.0.1:55440`, database `brightcone_demo`, username `postgres`, password `postgres`. See [DATABASE.md](../DATABASE.md) for pgAdmin and [DEPLOYMENT.md](../DEPLOYMENT.md) for production configuration.

From this directory, apply or inspect SeaORM migrations:

```powershell
cargo run -p brightcone-migration -- up
cargo run -p brightcone-migration -- status
cargo run -p brightcone-migration -- verify
```
