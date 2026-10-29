param(
    [Parameter(Mandatory = $true)]
    [string]$BackupDirectory,
    [switch]$DropExisting
)

if (-not $env:MONGODB_URI) {
    throw "Set MONGODB_URI before running the MongoDB restore."
}
if (-not (Get-Command mongorestore -ErrorAction SilentlyContinue)) {
    throw "mongorestore was not found. Install MongoDB Database Tools first."
}
$databaseBackup = Join-Path $BackupDirectory "banksphere"
if (-not (Test-Path -LiteralPath $databaseBackup -PathType Container)) {
    throw "Expected a banksphere backup directory at $databaseBackup."
}

$restoreArguments = @("--uri", $env:MONGODB_URI, "--db", "banksphere", $databaseBackup)
if ($DropExisting) {
    $restoreArguments += "--drop"
}
& mongorestore @restoreArguments
if ($LASTEXITCODE -ne 0) {
    throw "mongorestore failed with exit code $LASTEXITCODE."
}
Write-Output "BankSphere restore completed from $databaseBackup."
