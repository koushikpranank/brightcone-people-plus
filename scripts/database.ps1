param([ValidateSet('sync','status','verify')][string]$Action = 'status')
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $projectRoot '.env'
if (!(Test-Path -LiteralPath $envPath)) { throw 'Root .env is missing. Run scripts/setup-local.ps1.' }
# Use the same root configuration for the autonomous schema subprocess.
Get-Content -LiteralPath $envPath | ForEach-Object {
    if ($_ -match '^([^#=]+)=(.*)$') { [Environment]::SetEnvironmentVariable($Matches[1],$Matches[2],'Process') }
}
& cargo run --locked --manifest-path (Join-Path $projectRoot 'backend/Cargo.toml') --bin brightcone-schema -- $Action
if ($LASTEXITCODE -ne 0) { throw "Autonomous schema command failed: $Action" }
