param([int]$DatabasePort = 55440)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$pgBin = 'C:\Program Files\PostgreSQL\16\bin'
if (!(Test-Path -LiteralPath (Join-Path $pgBin 'initdb.exe'))) { throw 'PostgreSQL 16 is required. Set DATABASE_URL in .env to use your own PostgreSQL server.' }
$localRoot = Join-Path $projectRoot '.local'
$dataRoot = Join-Path $localRoot 'postgres-native'
New-Item -ItemType Directory -Force -Path $localRoot | Out-Null
if (!(Test-Path -LiteralPath (Join-Path $projectRoot '.env'))) {
    $randomBytes = New-Object byte[] 32
    [System.Security.Cryptography.RandomNumberGenerator]::Fill($randomBytes)
    $jwtSecret = [Convert]::ToHexString($randomBytes).ToLowerInvariant()
    [System.Security.Cryptography.RandomNumberGenerator]::Fill($randomBytes)
    $sessionSecret = [Convert]::ToHexString($randomBytes).ToLowerInvariant()
    @"
DATABASE_URL=postgres://postgres:postgres@127.0.0.1:$DatabasePort/brightcone_demo
PGHOST=127.0.0.1
PGPORT=$DatabasePort
PGDATABASE=brightcone_demo
PGUSER=postgres
PGPASSWORD=postgres
JWT_SECRET=$jwtSecret
SESSION_SECRET=$sessionSecret
PORT=5155
FRONTEND_PORT=5175
"@ | Set-Content -LiteralPath (Join-Path $projectRoot '.env') -Encoding utf8
}
$envValues = @{}
Get-Content -LiteralPath (Join-Path $projectRoot '.env') | ForEach-Object { if ($_ -match '^([^#=]+)=(.*)$') { $envValues[$Matches[1]] = $Matches[2] } }
$dbUri = [Uri]$envValues.DATABASE_URL
$dbUserInfo = $dbUri.UserInfo.Split(':', 2)
$dbUser = $dbUserInfo[0]
if ($dbUri.Host -notin @('127.0.0.1','localhost')) { throw 'The native setup helper is for localhost. Configure a remote database separately.' }
if ($dbUser -notmatch '^[A-Za-z_][A-Za-z0-9_]*$') { throw 'Unsupported database role name' }
$env:PGPASSWORD = [Uri]::UnescapeDataString($dbUserInfo[1])
if (!(Test-Path -LiteralPath (Join-Path $dataRoot 'PG_VERSION'))) {
    $passwordFile = Join-Path $localRoot 'init-password'
    try {
        [System.IO.File]::WriteAllText($passwordFile, $env:PGPASSWORD)
        & (Join-Path $pgBin 'initdb.exe') -D $dataRoot -U $dbUser --pwfile=$passwordFile -A scram-sha-256 --encoding=UTF8 --locale=C
        if ($LASTEXITCODE -ne 0) { throw 'initdb failed' }
        Add-Content -LiteralPath (Join-Path $dataRoot 'postgresql.conf') -Value "`nlisten_addresses = '127.0.0.1'`nport = $($dbUri.Port)`ntimezone = 'Asia/Kolkata'"
    } finally { Remove-Item -LiteralPath $passwordFile -ErrorAction SilentlyContinue }
}
& (Join-Path $pgBin 'pg_ctl.exe') -D $dataRoot status *> $null
if ($LASTEXITCODE -ne 0) {
    $pgLog = Join-Path $localRoot 'postgres.log'
    $pgCtlArgs = @('-D', ('"' + $dataRoot + '"'), '-l', ('"' + $pgLog + '"'), '-w', 'start')
    $startResult = Start-Process -FilePath (Join-Path $pgBin 'pg_ctl.exe') -ArgumentList $pgCtlArgs -WindowStyle Hidden -Wait -PassThru
    if ($startResult.ExitCode -ne 0) { throw "PostgreSQL failed to start. See $pgLog" }
}
$dbName = $dbUri.AbsolutePath.TrimStart('/')
if ($dbName -notmatch '^[a-zA-Z_][a-zA-Z0-9_]*$') { throw 'Unsupported database name' }
$dbVersion = & (Join-Path $pgBin 'psql.exe') -w -h 127.0.0.1 -p $dbUri.Port -U $dbUser -d postgres -X -At -v ON_ERROR_STOP=1 -c 'SHOW server_version_num'
if ($LASTEXITCODE -ne 0) { throw 'PostgreSQL login failed. Check the root .env connection.' }
if ([int]$dbVersion -lt 160000 -or [int]$dbVersion -ge 170000) { throw 'This project setup expects PostgreSQL 16.' }
$dbExists = & (Join-Path $pgBin 'psql.exe') -w -h 127.0.0.1 -p $dbUri.Port -U $dbUser -d postgres -X -At -v ON_ERROR_STOP=1 -c "SELECT 1 FROM pg_database WHERE datname='$dbName'"
if ($LASTEXITCODE -ne 0) { throw 'Database existence check failed' }
if ($dbExists -ne '1') {
    & (Join-Path $pgBin 'createdb.exe') -w -h 127.0.0.1 -p $dbUri.Port -U $dbUser $dbName
    if ($LASTEXITCODE -ne 0) { throw 'Database creation failed' }
}
Remove-Item Env:PGPASSWORD
Write-Output "PostgreSQL 16 is ready: host=127.0.0.1 port=$($dbUri.Port) database=$dbName user=$dbUser."
Write-Output 'Connection values are in the root .env. Run npm run db:migrate to apply SeaORM migrations, then npm run dev.'
