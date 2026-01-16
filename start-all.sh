#!/bin/bash

# Script para iniciar todos os microserviços e API Gateway
# Uso: ./start-all.sh [dev|prod]

set -e

MODE=${1:-dev}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Verificar se pnpm está instalado
if ! command -v pnpm &> /dev/null; then
    print_error "pnpm não está instalado. Instale com: npm install -g pnpm"
    exit 1
fi

# Verificar se Docker está rodando (para bancos de dados)
if command -v docker &> /dev/null; then
    if ! docker info &> /dev/null; then
        print_warning "Docker não está rodando. Iniciando bancos de dados com Docker..."
        print_info "Iniciando bancos de dados..."
        docker-compose -f docker-compose.microservices.yml up -d auth-db gallery-db notification-db redis
        print_info "Aguardando bancos de dados ficarem prontos..."
        sleep 5
    else
        print_info "Verificando se bancos de dados estão rodando..."
        if ! docker ps | grep -q "auth-db\|gallery-db\|notification-db\|redis"; then
            print_info "Iniciando bancos de dados..."
            docker-compose -f docker-compose.microservices.yml up -d auth-db gallery-db notification-db redis
            sleep 5
        fi
    fi
else
    print_warning "Docker não encontrado. Certifique-se de que os bancos de dados estão rodando."
fi

# Array para armazenar PIDs dos processos
PIDS=()

# Função para limpar processos ao sair
cleanup() {
    print_info "\nParando todos os serviços..."
    for pid in "${PIDS[@]}"; do
        if kill -0 "$pid" 2>/dev/null; then
            kill "$pid" 2>/dev/null || true
        fi
    done
    wait
    print_success "Todos os serviços foram parados."
    exit 0
}

# Capturar Ctrl+C
trap cleanup SIGINT SIGTERM

# Função para iniciar um serviço
start_service() {
    local SERVICE_NAME=$1
    local SERVICE_DIR=$2
    local PORT=$3
    
    print_info "Iniciando $SERVICE_NAME..."
    
    cd "$SERVICE_DIR"
    
    # Verificar se node_modules existe
    if [ ! -d "node_modules" ]; then
        print_warning "Instalando dependências de $SERVICE_NAME..."
        pnpm install
    fi
    
    # Gerar Prisma Client se necessário
    if [ -d "prisma" ]; then
        print_info "Gerando Prisma Client para $SERVICE_NAME..."
        pnpm prisma:generate || true
    fi
    
    # Iniciar serviço
    if [ "$MODE" = "prod" ]; then
        print_info "Construindo $SERVICE_NAME..."
        pnpm build || true
        pnpm start:prod > "/tmp/${SERVICE_NAME}.log" 2>&1 &
    else
        pnpm start:dev > "/tmp/${SERVICE_NAME}.log" 2>&1 &
    fi
    
    local PID=$!
    PIDS+=($PID)
    
    cd "$SCRIPT_DIR"
    
    # Aguardar serviço iniciar
    print_info "Aguardando $SERVICE_NAME iniciar na porta $PORT..."
    for i in {1..30}; do
        if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
            print_success "$SERVICE_NAME está rodando na porta $PORT"
            return 0
        fi
        sleep 1
    done
    
    print_error "$SERVICE_NAME não iniciou na porta $PORT"
    return 1
}

# Iniciar serviços na ordem correta
print_info "🚀 Iniciando todos os serviços..."
echo ""

# 1. Auth Service (deve iniciar primeiro)
start_service "auth-service" "$SCRIPT_DIR/auth-service" 3001

# 2. Gallery Service
start_service "gallery-service" "$SCRIPT_DIR/gallery-service" 3002

# 3. Notification Service
start_service "notification-service" "$SCRIPT_DIR/notification-service" 3003

# 4. API Gateway (deve iniciar por último)
start_service "api-gateway" "$SCRIPT_DIR/api-gateway" 3000

echo ""
print_success "✅ Todos os serviços foram iniciados!"
echo ""
print_info "📊 Status dos serviços:"
echo "  - Auth Service:        http://localhost:3001"
echo "  - Gallery Service:     http://localhost:3002"
echo "  - Notification Service: http://localhost:3003"
echo "  - API Gateway:         http://localhost:3000"
echo ""
print_info "📝 Logs disponíveis em:"
echo "  - /tmp/auth-service.log"
echo "  - /tmp/gallery-service.log"
echo "  - /tmp/notification-service.log"
echo "  - /tmp/api-gateway.log"
echo ""
print_info "Para ver os logs em tempo real, use:"
echo "  tail -f /tmp/*-service.log"
echo ""
print_warning "Pressione Ctrl+C para parar todos os serviços"

# Manter script rodando
wait
