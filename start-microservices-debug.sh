#!/bin/bash

# Script para iniciar todos os microserviços em modo DEBUG
# Cada serviço será iniciado em uma janela de terminal separada (macOS/Linux)

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🐛 Iniciando Microserviços em Modo DEBUG${NC}\n"

# Verificar se estamos no macOS ou Linux
if [[ "$OSTYPE" == "darwin"* ]]; then
    TERMINAL_CMD="osascript -e"
    OPEN_TERMINAL="osascript"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    TERMINAL_CMD="gnome-terminal --"
    OPEN_TERMINAL="gnome-terminal"
else
    echo -e "${RED}❌ Sistema operacional não suportado para modo debug${NC}"
    echo -e "${YELLOW}Use start-microservices.sh para modo normal${NC}"
    exit 1
fi

# Função para iniciar serviço em nova janela
start_service_debug() {
    local service=$1
    local port=$2
    local name=$3
    
    echo -e "${GREEN}🚀 Iniciando $name em modo debug (porta $port)...${NC}"
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        osascript <<EOF
tell application "Terminal"
    do script "cd '$PWD/$service' && pnpm start:dev"
    activate
end tell
EOF
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux (GNOME)
        gnome-terminal --tab --title="$name" -- bash -c "cd '$PWD/$service' && pnpm start:dev; exec bash"
    fi
    
    sleep 2
}

# Verificar se os arquivos .env existem
if [ ! -f "auth-service/.env" ] || [ ! -f "gallery-service/.env" ] || [ ! -f "notification-service/.env" ] || [ ! -f "api-gateway/.env" ]; then
    echo -e "${YELLOW}⚠️  Arquivos .env não encontrados. Execute primeiro:${NC}"
    echo -e "${YELLOW}   ./start-microservices.sh${NC}"
    echo -e "${YELLOW}   (Isso criará os arquivos .env)${NC}\n"
    read -p "Continuar mesmo assim? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Iniciar serviços em ordem
echo -e "${BLUE}Iniciando serviços em janelas separadas...${NC}\n"

# 1. Auth Service
start_service_debug "auth-service" 3001 "Auth Service"

# 2. Gallery Service
start_service_debug "gallery-service" 3002 "Gallery Service"

# 3. Notification Service
start_service_debug "notification-service" 3003 "Notification Service"

# 4. API Gateway
start_service_debug "api-gateway" 3000 "API Gateway"

echo -e "\n${GREEN}✨ Todos os serviços iniciados em modo debug!${NC}\n"
echo -e "${BLUE}📝 Cada serviço está rodando em uma janela de terminal separada${NC}"
echo -e "${BLUE}🌐 Acesse:${NC}"
echo -e "   - API Gateway: http://localhost:3000/api"
echo -e "   - Frontend: http://localhost:5173"
echo -e "\n${YELLOW}💡 Para parar, feche as janelas de terminal ou use Ctrl+C em cada uma${NC}\n"
