# UniVoyage backend — start Docker stack with terminal splash
# Usage:
#   .\scripts\start.ps1           # foreground logs
#   .\scripts\start.ps1 -Detached # docker compose up --build -d
param(
    [switch]$Detached
)

$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")

if ($Detached) {
    docker compose up --build -d
    Write-Host ""
    Write-Host "Backend started in background. Check: docker compose ps" -ForegroundColor DarkGray
    Write-Host "Health: http://127.0.0.1:8080/actuator/health" -ForegroundColor DarkGray
    Write-Host ""
} else {
    docker compose up --build @args
}
