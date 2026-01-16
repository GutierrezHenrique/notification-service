#!/bin/bash

# Script para parar todos os microserviços

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}🛑 Parando microserviços...${NC}\n"

# Função para parar serviço
stop_service() {
    local service=$1
    local pid_file="logs/$service.pid"
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if ps -p $pid > /dev/null 2>&1; then
            echo -e "${YELLOW}Parando $service (PID: $pid)...${NC}"
            kill $pid 2>/dev/null
            sleep 1
            # Forçar kill se ainda estiver rodando
            if ps -p $pid > /dev/null 2>&1; then
                kill -9 $pid 2>/dev/null
            fi
            echo -e "${GREEN}✅ $service parado${NC}"
        fi
        rm -f "$pid_file"
    else
        # Tentar encontrar processo pela porta
        case $service in
            auth-service)
                local port=3001
                ;;
            gallery-service)
                local port=3002
                ;;
            notification-service)
                local port=3003
                ;;
            api-gateway)
                local port=3000
                ;;
            *)
                return
                ;;
        esac
        
        local pid=$(lsof -ti:$port 2>/dev/null)
        if [ ! -z "$pid" ]; then
            echo -e "${YELLOW}Parando processo na porta $port (PID: $pid)...${NC}"
            kill $pid 2>/dev/null
            sleep 1
            if ps -p $pid > /dev/null 2>&1; then
                kill -9 $pid 2>/dev/null
            fi
            echo -e "${GREEN}✅ Processo na porta $port parado${NC}"
        fi
    fi
}

# Parar serviços na ordem inversa
stop_service "api-gateway"
stop_service "notification-service"
stop_service "gallery-service"
stop_service "auth-service"

echo -e "\n${GREEN}✨ Todos os serviços foram parados${NC}\n"
