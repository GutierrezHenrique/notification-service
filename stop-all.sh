#!/bin/bash

# Script para parar todos os serviços
# Uso: ./stop-all.sh

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Função para matar processos na porta
kill_port() {
    local PORT=$1
    local SERVICE_NAME=$2
    
    # Encontrar PIDs usando a porta
    local PIDS=$(lsof -ti :$PORT 2>/dev/null || true)
    
    if [ -n "$PIDS" ]; then
        print_info "Parando $SERVICE_NAME na porta $PORT..."
        echo "$PIDS" | xargs kill -9 2>/dev/null || true
        print_success "$SERVICE_NAME parado"
    else
        print_warning "$SERVICE_NAME não está rodando na porta $PORT"
    fi
}

print_info "🛑 Parando todos os serviços..."
echo ""

# Parar serviços
kill_port 3000 "API Gateway"
kill_port 3001 "Auth Service"
kill_port 3002 "Gallery Service"
kill_port 3003 "Notification Service"

echo ""
print_success "✅ Todos os serviços foram parados!"

# Opcional: parar containers Docker
read -p "Deseja parar os containers Docker também? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Parando containers Docker..."
    docker-compose -f docker-compose.microservices.yml down 2>/dev/null || true
    print_success "Containers Docker parados"
fi
