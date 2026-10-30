param([ValidateSet('up','status','verify')][string]$Action = 'status')
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $projectRoot '.env'
if (!(Test-Path -LiteralPath $envPath)) { throw 'Root .env is missing. Run scripts/setup-local.ps1.' }
# Set the same configuration for Cargo's migration subprocess and psql.
Get-Content -LiteralPath $envPath | ForEach-Object {
    if ($_ -match '^([^#=]+)=(.*)$') { [Environment]::SetEnvironmentVariable($Matches[1],$Matches[2],'Process') }
}
& cargo run --manifest-path (Join-Path $projectRoot 'backend/Cargo.toml') -p brightcone-migration -- $Action
if ($LASTEXITCODE -ne 0) { throw "SeaORM database command failed: $Action" }
