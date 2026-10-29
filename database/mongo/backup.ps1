param(
    [Parameter(Mandatory = $true)]
    [string]$OutputDirectory
)

if (-not $env:MONGODB_URI) {
    throw "Set MONGODB_URI before running the MongoDB backup."
}
if (-not (Get-Command mongodump -ErrorAction SilentlyContinue)) {
    throw "mongodump was not found. Install MongoDB Database Tools first."
}

New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null
& mongodump --uri $env:MONGODB_URI --db banksphere --out $OutputDirectory
if ($LASTEXITCODE -ne 0) {
    throw "mongodump failed with exit code $LASTEXITCODE."
}
Write-Output "BankSphere backup created at $OutputDirectory."
