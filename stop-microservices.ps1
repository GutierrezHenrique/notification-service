# Script PowerShell para parar todos os microserviços

Write-Host "🛑 Parando microserviços..." -ForegroundColor Yellow
Write-Host ""

# Parar jobs do PowerShell
if (Test-Path "logs\jobs.txt") {
    Get-Content "logs\jobs.txt" | ForEach-Object {
        $jobId = $_
        $job = Get-Job -Id $jobId -ErrorAction SilentlyContinue
        if ($job) {
            Write-Host "Parando job $jobId..." -ForegroundColor Yellow
            Stop-Job -Id $jobId -ErrorAction SilentlyContinue
            Remove-Job -Id $jobId -ErrorAction SilentlyContinue
        }
    }
    Remove-Item "logs\jobs.txt" -ErrorAction SilentlyContinue
}

# Parar processos Node.js nas portas específicas
$ports = @(
    @{Port=3000; Name="API Gateway"},
    @{Port=3001; Name="Auth Service"},
    @{Port=3002; Name="Gallery Service"},
    @{Port=3003; Name="Notification Service"}
)

foreach ($service in $ports) {
    $processes = Get-NetTCPConnection -LocalPort $service.Port -ErrorAction SilentlyContinue | 
                 Select-Object -ExpandProperty OwningProcess -Unique
    
    foreach ($pid in $processes) {
        $proc = Get-Process -Id $pid -ErrorAction SilentlyContinue
        if ($proc -and $proc.ProcessName -eq "node") {
            Write-Host "Parando $($service.Name) (PID: $pid)..." -ForegroundColor Yellow
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            Write-Host "✅ $($service.Name) parado" -ForegroundColor Green
        }
    }
}

Write-Host "`n✨ Todos os serviços foram parados" -ForegroundColor Green
Write-Host ""
