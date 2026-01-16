# Script PowerShell para parar todos os serviços
# Uso: .\stop-all.ps1

param(
    [switch]$StopDocker = $false
)

function Write-Info {
    Write-Host "ℹ " -NoNewline -ForegroundColor Blue
    Write-Host $args
}

function Write-Success {
    Write-Host "✓ " -NoNewline -ForegroundColor Green
    Write-Host $args
}

function Write-Warning {
    Write-Host "⚠ " -NoNewline -ForegroundColor Yellow
    Write-Host $args
}

function Stop-Port {
    param(
        [int]$Port,
        [string]$ServiceName
    )
    
    $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    if ($connections) {
        Write-Info "Parando $ServiceName na porta $Port..."
        $connections | ForEach-Object {
            Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
        }
        Write-Success "$ServiceName parado"
    } else {
        Write-Warning "$ServiceName não está rodando na porta $Port"
    }
}

Write-Info "🛑 Parando todos os serviços..."
Write-Host ""

Stop-Port 3000 "API Gateway"
Stop-Port 3001 "Auth Service"
Stop-Port 3002 "Gallery Service"
Stop-Port 3003 "Notification Service"

Write-Host ""
Write-Success "✅ Todos os serviços foram parados!"

if ($StopDocker -or (Read-Host "Deseja parar os containers Docker também? (y/N)") -eq "y") {
    Write-Info "Parando containers Docker..."
    docker-compose -f docker-compose.microservices.yml down 2>&1 | Out-Null
    Write-Success "Containers Docker parados"
}
