param([string]$Database = '', [string]$LifecycleEvidence = '')
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$taskValues = @{}
Get-Content -LiteralPath (Join-Path $projectRoot '.env') | ForEach-Object { if ($_ -match '^([^#=]+)=(.*)$') { $taskValues[$Matches[1]] = $Matches[2] } }
$taskUri = [uri]$taskValues.DATABASE_URL
if (!$Database) { $Database = $taskUri.AbsolutePath.TrimStart('/') }
if ($Database -notmatch '^[a-z0-9_]+$') { throw 'Invalid evidence database name' }
$env:PGPASSWORD = [uri]::UnescapeDataString($taskUri.UserInfo.Split(':', 2)[1])
$env:PGCLIENTENCODING = 'UTF8'
$sqlLines = [System.Collections.Generic.List[string]]::new()
$sqlLines.Add("SELECT jsonb_build_object('section','database','database',current_database(),'generatedAt',now(),'serverVersion',current_setting('server_version'));")
$tables = Get-Content -LiteralPath (Join-Path $projectRoot 'backend/src/models/tables.json') -Raw | ConvertFrom-Json -AsHashtable
$targetDir = Join-Path $projectRoot 'output/audit'
if ($LifecycleEvidence) {
    $life = Get-Content -LiteralPath $LifecycleEvidence -Raw | ConvertFrom-Json -AsHashtable
    $employeeId = $life.person.employeeId
    $email = $life.person.email
    $personName = $life.person.name.Replace("'", "''")
    if ($employeeId -notmatch '^[A-Z0-9-]+$' -or $email -notmatch '^[a-z0-9.@_-]+$') { throw 'Invalid simulation identity' }
    $targetDir = Split-Path -Parent $LifecycleEvidence
    $sqlLines.Add("SELECT jsonb_build_object('section','employee','table','demo.employees','records',coalesce(jsonb_agg(record),'[]')) FROM demo.employees WHERE id='$employeeId';")
    $sqlLines.Add("SELECT jsonb_build_object('section','account','table','demo.accounts','records',coalesce(jsonb_agg(record - 'pass' - 'pass_hash'),'[]')) FROM demo.accounts WHERE id='$email';")
    foreach($key in $tables.demo.Keys){
        if($key -in @('employees','accounts','audit')){continue}
        $tableName=$tables.demo[$key].table
        if($tableName -notmatch '^demo\."?[A-Za-z0-9_]+"?$'){throw 'Invalid demo table'}
        if($tables.demo[$key].kind -eq 'array'){
            $sqlLines.Add("SELECT jsonb_build_object('section','demo','key','$key','table','$tableName','count',count(*),'records',coalesce(jsonb_agg(record),'[]')) FROM $tableName WHERE strpos(record::text,'$personName')>0 OR record->>'email'='$email' OR record->>'emp'='$employeeId';")
        }elseif($key -in @('decl','dependents','progress','reviews')){
            $sqlLines.Add("SELECT jsonb_build_object('section','demo_personal','key','$key','records',record->'$personName') FROM $tableName;")
        }
    }
    $payrollId=$life.payroll.id
    $sqlLines.Add("SELECT jsonb_build_object('section','demo_payroll','records',jsonb_build_object('month',record->'month','inputs',(SELECT coalesce(jsonb_agg(v),'[]') FROM jsonb_array_elements(record->'inputs') v WHERE v->>'emp'='$personName'),'run',(SELECT v FROM jsonb_array_elements(record->'runs') v WHERE v->>'id'='$payrollId'))) FROM demo.payroll;")
    foreach ($key in $tables.live.Keys) {
        $tableName = $tables.live[$key].table
        if ($tableName -notmatch '^live\."?[A-Za-z0-9_]+"?$') { throw 'Invalid source table' }
        $sqlLines.Add("SELECT jsonb_build_object('section','live','key','$key','table','$tableName','count',count(*),'records',coalesce(jsonb_agg(record),'[]')) FROM $tableName WHERE record->>'emp'='$employeeId' OR record->>'id'='$employeeId' OR record->>'email'='$email';")
    }
    $sqlLines.Add("SELECT jsonb_build_object('section','money_runs','records',coalesce(jsonb_agg(record),'[]')) FROM public.money_runs WHERE employee_id='$employeeId' OR record->'rows' @> '[{`"emp`":`"$employeeId`"}]'::jsonb;")
    $sqlLines.Add("SELECT jsonb_build_object('section','policy_history','records',coalesce(jsonb_agg(jsonb_build_object('revision',revision,'createdAt',created_at,'createdBy',created_by,'policy',(record - 'overrides') || jsonb_build_object('overrides',jsonb_build_object('$employeeId',record->'overrides'->'$employeeId')))),'[]')) FROM public.money_policy_history WHERE record->'overrides' ? '$employeeId';")
    $sqlLines.Add("SELECT jsonb_build_object('section','live_audit','records',coalesce(jsonb_agg(record),'[]')) FROM live.audit WHERE record->>'by'='$email' OR strpos(record::text,'$employeeId')>0 OR strpos(record::text,'Koushik Reddy')>0;")
    $sqlLines.Add("SELECT jsonb_build_object('section','demo_audit','records',coalesce(jsonb_agg(record),'[]')) FROM demo.audit WHERE record->>'who'='Koushik Reddy' OR strpos(record::text,'$employeeId')>0 OR strpos(record::text,'Koushik Reddy')>0;")
} else {
    $forms = Get-Content -LiteralPath (Join-Path $projectRoot 'output/audit/form-results.json') -Raw | ConvertFrom-Json -AsHashtable
    foreach ($r in $forms.registers) {
        $key = $r.key; $recordId = $r.id; $tableName = $tables.live[$key].table
        if ($recordId -notmatch '^[A-Z0-9-]+$' -or $tableName -notmatch '^live\."?[A-Za-z0-9_]+"?$') { throw 'Invalid form identity' }
        $sqlLines.Add("SELECT jsonb_build_object('section','form_database_proof','key','$key','id','$recordId','exists',EXISTS(SELECT 1 FROM $tableName WHERE id='$recordId'),'record',(SELECT record FROM $tableName WHERE id='$recordId'));")
    }
}
New-Item -ItemType Directory -Force -Path $targetDir | Out-Null
$sqlPath = Join-Path $targetDir 'database-verification.sql'
$jsonPath = Join-Path $targetDir 'database-evidence.jsonl'
$sqlLines | Set-Content -LiteralPath $sqlPath -Encoding utf8
try {
    & 'C:\Program Files\PostgreSQL\16\bin\psql.exe' -w -h $taskUri.Host -p $taskUri.Port -U ([uri]::UnescapeDataString($taskUri.UserInfo.Split(':',2)[0])) -d $Database -X -A -t -v ON_ERROR_STOP=1 -f $sqlPath -o $jsonPath
    if ($LASTEXITCODE -ne 0) { throw 'Database verification failed' }
} finally { Remove-Item Env:PGPASSWORD }
$result = @(Get-Content -LiteralPath $jsonPath | Where-Object { $_.Trim() } | ForEach-Object { $_ | ConvertFrom-Json -AsHashtable })
if (!$LifecycleEvidence -and ($result.Where({$_.section -eq 'form_database_proof'}).Count -ne 52 -or $result.Where({$_.section -eq 'form_database_proof' -and !$_.exists}).Count)) { throw 'Not all 52 form records exist in PostgreSQL' }
$result | ConvertTo-Json -Depth 100 | Set-Content -LiteralPath (Join-Path $targetDir 'database-evidence.json') -Encoding utf8
Write-Output "Verified PostgreSQL evidence in $targetDir"
