# Script PowerShell para iniciar todos os microserviços e API Gateway
# Uso: .\start-all.ps1 [dev|prod]

param(
    [string]$Mode = "dev"
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Funções para output colorido
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

function Write-Error {
    Write-Host "✗ " -NoNewline -ForegroundColor Red
    Write-Host $args
}

# Verificar se pnpm está instalado
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Error "pnpm não está instalado. Instale com: npm install -g pnpm"
    exit 1
}

# Verificar Docker
$dockerRunning = $false
if (Get-Command docker -ErrorAction SilentlyContinue) {
    try {
        docker info | Out-Null
        $dockerRunning = $true
    } catch {
        Write-Warning "Docker não está rodando"
    }
}

if ($dockerRunning) {
    Write-Info "Verificando bancos de dados..."
    $containers = docker ps --format "{{.Names}}"
    $neededContainers = @("auth-db", "gallery-db", "notification-db", "redis")
    $missingContainers = $neededContainers | Where-Object { $containers -notcontains $_ }
    
    if ($missingContainers.Count -gt 0) {
        Write-Info "Iniciando bancos de dados..."
        docker-compose -f docker-compose.microservices.yml up -d auth-db gallery-db notification-db redis
        Start-Sleep -Seconds 5
    }
} else {
    Write-Warning "Docker não encontrado. Certifique-se de que os bancos de dados estão rodando."
}

# Array para armazenar processos
$Processes = @()

# Função para limpar processos
function Cleanup {
    Write-Info "Parando todos os serviços..."
    foreach ($proc in $Processes) {
        if (-not $proc.HasExited) {
            Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
        }
    }
    Write-Success "Todos os serviços foram parados."
    exit 0
}

# Capturar Ctrl+C
[Console]::TreatControlCAsInput = $false
$null = Register-EngineEvent PowerShell.Exiting -Action { Cleanup }

# Função para iniciar um serviço
function Start-Service {
    param(
        [string]$ServiceName,
        [string]$ServiceDir,
        [int]$Port
    )
    
    Write-Info "Iniciando $ServiceName..."
    
    Push-Location $ServiceDir
    
    # Verificar dependências
    if (-not (Test-Path "node_modules")) {
        Write-Warning "Instalando dependências de $ServiceName..."
        pnpm install
    }
    
    # Gerar Prisma Client
    if (Test-Path "prisma") {
        Write-Info "Gerando Prisma Client para $ServiceName..."
        pnpm prisma:generate 2>&1 | Out-Null
    }
    
    # Iniciar serviço
    $logFile = "$env:TEMP\$ServiceName.log"
    if ($Mode -eq "prod") {
        Write-Info "Construindo $ServiceName..."
        pnpm build 2>&1 | Out-Null
        $proc = Start-Process -FilePath "pnpm" -ArgumentList "start:prod" -PassThru -NoNewWindow -RedirectStandardOutput $logFile -RedirectStandardError $logFile
    } else {
        $proc = Start-Process -FilePath "pnpm" -ArgumentList "start:dev" -PassThru -NoNewWindow -RedirectStandardOutput $logFile -RedirectStandardError $logFile
    }
    
    $Processes += $proc
    Pop-Location
    
    # Aguardar serviço iniciar
    Write-Info "Aguardando $ServiceName iniciar na porta $Port..."
    $maxAttempts = 30
    $attempt = 0
    $started = $false
    
    while ($attempt -lt $maxAttempts) {
        try {
            $connection = Test-NetConnection -ComputerName localhost -Port $Port -WarningAction SilentlyContinue -InformationLevel Quiet
            if ($connection) {
                Write-Success "$ServiceName está rodando na porta $Port"
                $started = $true
                break
            }
        } catch {
            # Ignorar erros
        }
        Start-Sleep -Seconds 1
        $attempt++
    }
    
    if (-not $started) {
        Write-Error "$ServiceName não iniciou na porta $Port"
        return $false
    }
    
    return $true
}

# Iniciar serviços
Write-Info "🚀 Iniciando todos os serviços..."
Write-Host ""

Start-Service "auth-service" "$ScriptDir\auth-service" 3001
Start-Service "gallery-service" "$ScriptDir\gallery-service" 3002
Start-Service "notification-service" "$ScriptDir\notification-service" 3003
Start-Service "api-gateway" "$ScriptDir\api-gateway" 3000

Write-Host ""
Write-Success "✅ Todos os serviços foram iniciados!"
Write-Host ""
Write-Info "📊 Status dos serviços:"
Write-Host "  - Auth Service:        http://localhost:3001"
Write-Host "  - Gallery Service:     http://localhost:3002"
Write-Host "  - Notification Service: http://localhost:3003"
Write-Host "  - API Gateway:         http://localhost:3000"
Write-Host ""
Write-Info "📝 Logs disponíveis em:"
Write-Host "  - $env:TEMP\auth-service.log"
Write-Host "  - $env:TEMP\gallery-service.log"
Write-Host "  - $env:TEMP\notification-service.log"
Write-Host "  - $env:TEMP\api-gateway.log"
Write-Host ""
Write-Warning "Pressione Ctrl+C para parar todos os serviços"

# Manter script rodando
try {
    while ($true) {
        Start-Sleep -Seconds 1
        # Verificar se algum processo terminou
        $Processes = $Processes | Where-Object { -not $_.HasExited }
        if ($Processes.Count -eq 0) {
            Write-Warning "Todos os processos terminaram"
            break
        }
    }
} catch {
    Cleanup
}
