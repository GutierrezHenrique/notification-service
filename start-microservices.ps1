# Script PowerShell para iniciar todos os microserviços em modo desenvolvimento

Write-Host "🚀 Iniciando Microserviços - Photo For You" -ForegroundColor Blue
Write-Host ""

# Verificar dependências
Write-Host "Verificando dependências..." -ForegroundColor Yellow

if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ pnpm não encontrado. Instale com: npm install -g pnpm" -ForegroundColor Red
    exit 1
}

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js não encontrado" -ForegroundColor Red
    exit 1
}

# Verificar portas
function Test-Port {
    param([int]$Port)
    $connection = Test-NetConnection -ComputerName localhost -Port $Port -WarningAction SilentlyContinue
    return $connection.TcpTestSucceeded
}

$ports = @(3000, 3001, 3002, 3003)
foreach ($port in $ports) {
    if (Test-Port -Port $port) {
        Write-Host "❌ Porta $port já está em uso" -ForegroundColor Red
        exit 1
    }
}

# Criar arquivos .env
function New-EnvFile {
    param([string]$Service, [string]$Content)
    $envFile = "$Service\.env"
    if (-not (Test-Path $envFile)) {
        Write-Host "📝 Criando $envFile" -ForegroundColor Yellow
        Set-Content -Path $envFile -Value $Content
        Write-Host "✅ $envFile criado" -ForegroundColor Green
    }
}

# Criar .env files
$authEnv = @"
AUTH_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/auth_db?schema=public"
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRES_IN=24h
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173
THROTTLE_TTL=60000
THROTTLE_LIMIT=100
"@

$galleryEnv = @"
GALLERY_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gallery_db?schema=public"
AUTH_SERVICE_URL=http://localhost:3001
JWT_SECRET=dev-secret-key-change-in-production
PORT=3002
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=your-bucket-name
THROTTLE_TTL=60000
THROTTLE_LIMIT=100
MAX_FILE_SIZE=10485760
"@

$notificationEnv = @"
NOTIFICATION_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/notification_db?schema=public"
REDIS_HOST=localhost
REDIS_PORT=6379
AUTH_SERVICE_URL=http://localhost:3001
JWT_SECRET=dev-secret-key-change-in-production
PORT=3003
NODE_ENV=development
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@mygallery.com
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173
THROTTLE_TTL=60000
THROTTLE_LIMIT=100
"@

$gatewayEnv = @"
PORT=3000
NODE_ENV=development
AUTH_SERVICE_URL=http://localhost:3001
GALLERY_SERVICE_URL=http://localhost:3002
NOTIFICATION_SERVICE_URL=http://localhost:3003
JWT_SECRET=dev-secret-key-change-in-production
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173
THROTTLE_TTL=60000
THROTTLE_LIMIT=100
"@

New-EnvFile -Service "auth-service" -Content $authEnv
New-EnvFile -Service "gallery-service" -Content $galleryEnv
New-EnvFile -Service "notification-service" -Content $notificationEnv
New-EnvFile -Service "api-gateway" -Content $gatewayEnv

# Instalar dependências
Write-Host "`n📦 Instalando dependências..." -ForegroundColor Blue

$services = @("auth-service", "gallery-service", "notification-service", "api-gateway")
foreach ($service in $services) {
    if (-not (Test-Path "$service\node_modules")) {
        Write-Host "📦 Instalando dependências de $service..." -ForegroundColor Yellow
        Set-Location $service
        pnpm install
        Set-Location ..
    }
}

# Gerar Prisma Clients
Write-Host "`n🔧 Gerando Prisma Clients..." -ForegroundColor Blue

$prismaServices = @("auth-service", "gallery-service", "notification-service")
foreach ($service in $prismaServices) {
    if (Test-Path "$service\prisma") {
        Write-Host "🔧 Gerando Prisma Client para $service..." -ForegroundColor Yellow
        Set-Location $service
        pnpm prisma:generate 2>$null
        Set-Location ..
    }
}

# Criar diretório de logs
New-Item -ItemType Directory -Force -Path "logs" | Out-Null

# Iniciar serviços
Write-Host "`n🚀 Iniciando serviços..." -ForegroundColor Blue

$jobs = @()

# Auth Service
Write-Host "`n🚀 Iniciando Auth Service na porta 3001..." -ForegroundColor Green
$authJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    Set-Location "auth-service"
    pnpm start:dev
}
$jobs += $authJob
Start-Sleep -Seconds 3

# Gallery Service
Write-Host "🚀 Iniciando Gallery Service na porta 3002..." -ForegroundColor Green
$galleryJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    Set-Location "gallery-service"
    pnpm start:dev
}
$jobs += $galleryJob
Start-Sleep -Seconds 2

# Notification Service
Write-Host "🚀 Iniciando Notification Service na porta 3003..." -ForegroundColor Green
$notificationJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    Set-Location "notification-service"
    pnpm start:dev
}
$jobs += $notificationJob
Start-Sleep -Seconds 2

# API Gateway
Write-Host "🚀 Iniciando API Gateway na porta 3000..." -ForegroundColor Green
$gatewayJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    Set-Location "api-gateway"
    pnpm start:dev
}
$jobs += $gatewayJob

# Aguardar serviços iniciarem
Write-Host "`n⏳ Aguardando serviços iniciarem..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# Verificar status
Write-Host "`n📊 Status dos Serviços:`n" -ForegroundColor Blue

function Test-Service {
    param([string]$Name, [int]$Port, [string]$Path)
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$Port$Path" -TimeoutSec 2 -ErrorAction Stop
        Write-Host "✅ $Name (http://localhost:$Port)" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  $Name (http://localhost:$Port) - Verificando..." -ForegroundColor Yellow
    }
}

Test-Service -Name "API Gateway" -Port 3000 -Path "/api"
Test-Service -Name "Auth Service" -Port 3001 -Path "/auth"
Test-Service -Name "Gallery Service" -Port 3002 -Path "/albums"
Test-Service -Name "Notification Service" -Port 3003 -Path "/notifications"

Write-Host "`n✨ Todos os serviços iniciados!" -ForegroundColor Green
Write-Host "`n📝 Logs disponíveis nos jobs do PowerShell" -ForegroundColor Blue
Write-Host "`n🛑 Para parar todos os serviços:" -ForegroundColor Blue
Write-Host "   .\stop-microservices.ps1" -ForegroundColor Yellow
Write-Host "`n🌐 Acesse:" -ForegroundColor Blue
Write-Host "   - API Gateway: http://localhost:3000/api" -ForegroundColor Cyan
Write-Host "   - Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "`n💡 Dica: Use 'Receive-Job -Id <job-id>' para ver logs" -ForegroundColor Yellow
Write-Host ""

# Salvar job IDs
$jobs | ForEach-Object { $_.Id } | Out-File -FilePath "logs\jobs.txt"

# Manter script rodando
Write-Host "Pressione Ctrl+C para parar todos os serviços..." -ForegroundColor Yellow
Write-Host ""

try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    Write-Host "`nParando serviços..." -ForegroundColor Yellow
    Get-Content "logs\jobs.txt" | ForEach-Object {
        Stop-Job -Id $_ -ErrorAction SilentlyContinue
        Remove-Job -Id $_ -ErrorAction SilentlyContinue
    }
    Write-Host "✨ Todos os serviços foram parados" -ForegroundColor Green
}
