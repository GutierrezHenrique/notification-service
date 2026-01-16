#!/bin/bash

# Script para iniciar todos os microserviços em modo desenvolvimento
# Requer: PostgreSQL, Redis, Node.js 18+, pnpm

set -e

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Iniciando Microserviços - Photo For You${NC}\n"

# Verificar dependências
echo -e "${YELLOW}Verificando dependências...${NC}"

command -v pnpm >/dev/null 2>&1 || { echo -e "${RED}❌ pnpm não encontrado. Instale com: npm install -g pnpm${NC}"; exit 1; }
command -v node >/dev/null 2>&1 || { echo -e "${RED}❌ Node.js não encontrado${NC}"; exit 1; }
command -v psql >/dev/null 2>&1 || { echo -e "${YELLOW}⚠️  psql não encontrado. Certifique-se de que PostgreSQL está instalado${NC}"; }

# Verificar se Redis está rodando
if ! redis-cli ping >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Redis não está rodando. Inicie com: redis-server${NC}"
    echo -e "${YELLOW}   Ou use Docker: docker run -d -p 6379:6379 redis:7-alpine${NC}\n"
fi

# Função para verificar se uma porta está em uso
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${RED}❌ Porta $1 já está em uso${NC}"
        return 1
    fi
    return 0
}

# Verificar portas
echo -e "${YELLOW}Verificando portas...${NC}"
check_port 3000 || exit 1
check_port 3001 || exit 1
check_port 3002 || exit 1
check_port 3003 || exit 1

# Criar arquivos .env se não existirem
create_env_file() {
    local service=$1
    local env_file="$service/.env"
    
    if [ ! -f "$env_file" ]; then
        echo -e "${YELLOW}📝 Criando $env_file${NC}"
        case $service in
            auth-service)
                cat > "$env_file" << EOF
# Database
AUTH_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/auth_db?schema=public"

# JWT
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRES_IN=24h

# Application
PORT=3001
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173

# Rate Limiting
THROTTLE_TTL=60000
THROTTLE_LIMIT=100
EOF
                ;;
            gallery-service)
                cat > "$env_file" << EOF
# Database
GALLERY_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gallery_db?schema=public"

# Auth Service
AUTH_SERVICE_URL=http://localhost:3001
JWT_SECRET=dev-secret-key-change-in-production

# Application
PORT=3002
NODE_ENV=development

# Storage (Cloudflare R2)
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=your-bucket-name
R2_PUBLIC_URL=

# CORS
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173

# Rate Limiting
THROTTLE_TTL=60000
THROTTLE_LIMIT=100

# File Upload
MAX_FILE_SIZE=10485760
EOF
                ;;
            notification-service)
                cat > "$env_file" << EOF
# Database
NOTIFICATION_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/notification_db?schema=public"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Auth Service
AUTH_SERVICE_URL=http://localhost:3001
JWT_SECRET=dev-secret-key-change-in-production

# Application
PORT=3003
NODE_ENV=development

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@mygallery.com
SMTP_FROM_NAME=MyGallery

# CORS
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173

# Rate Limiting
THROTTLE_TTL=60000
THROTTLE_LIMIT=100
EOF
                ;;
            api-gateway)
                cat > "$env_file" << EOF
# Application
PORT=3000
NODE_ENV=development

# Microservices URLs
AUTH_SERVICE_URL=http://localhost:3001
GALLERY_SERVICE_URL=http://localhost:3002
NOTIFICATION_SERVICE_URL=http://localhost:3003

# JWT (deve ser o mesmo do Auth Service)
JWT_SECRET=dev-secret-key-change-in-production

# CORS
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173

# Rate Limiting
THROTTLE_TTL=60000
THROTTLE_LIMIT=100
EOF
                ;;
        esac
        echo -e "${GREEN}✅ $env_file criado${NC}"
    fi
}

# Criar .env files
create_env_file "auth-service"
create_env_file "gallery-service"
create_env_file "notification-service"
create_env_file "api-gateway"

# Função para instalar dependências
install_deps() {
    local service=$1
    if [ ! -d "$service/node_modules" ]; then
        echo -e "${YELLOW}📦 Instalando dependências de $service...${NC}"
        cd "$service"
        pnpm install
        cd ..
    fi
}

# Função para gerar Prisma Client
generate_prisma() {
    local service=$1
    if [ -d "$service/prisma" ]; then
        echo -e "${YELLOW}🔧 Gerando Prisma Client para $service...${NC}"
        cd "$service"
        pnpm prisma:generate 2>/dev/null || echo -e "${YELLOW}⚠️  Prisma ainda não configurado${NC}"
        cd ..
    fi
}

# Instalar dependências
echo -e "\n${BLUE}📦 Instalando dependências...${NC}"
install_deps "auth-service"
install_deps "gallery-service"
install_deps "notification-service"
install_deps "api-gateway"

# Gerar Prisma Clients
echo -e "\n${BLUE}🔧 Gerando Prisma Clients...${NC}"
generate_prisma "auth-service"
generate_prisma "gallery-service"
generate_prisma "notification-service"

# Função para iniciar serviço em background
start_service() {
    local service=$1
    local port=$2
    local name=$3
    
    echo -e "\n${GREEN}🚀 Iniciando $name na porta $port...${NC}"
    cd "$service"
    
    # Criar diretório de logs se não existir
    mkdir -p ../logs
    
    # Iniciar em background e salvar PID
    pnpm start:dev > "../logs/$service.log" 2>&1 &
    local pid=$!
    echo $pid > "../logs/$service.pid"
    
    cd ..
    
    # Aguardar serviço iniciar
    echo -e "${YELLOW}⏳ Aguardando $name iniciar...${NC}"
    for i in {1..30}; do
        if curl -s http://localhost:$port >/dev/null 2>&1 || lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            echo -e "${GREEN}✅ $name iniciado (PID: $pid)${NC}"
            return 0
        fi
        sleep 1
    done
    
    echo -e "${RED}❌ $name não iniciou a tempo${NC}"
    return 1
}

# Criar diretório de logs
mkdir -p logs

# Iniciar serviços na ordem correta
echo -e "\n${BLUE}🚀 Iniciando serviços...${NC}"

# 1. Auth Service (deve iniciar primeiro)
start_service "auth-service" 3001 "Auth Service"

# Aguardar um pouco antes de iniciar os próximos
sleep 3

# 2. Gallery Service
start_service "gallery-service" 3002 "Gallery Service"

# 3. Notification Service
start_service "notification-service" 3003 "Notification Service"

# Aguardar serviços iniciarem
sleep 5

# 4. API Gateway (deve iniciar por último)
start_service "api-gateway" 3000 "API Gateway"

# Aguardar API Gateway iniciar
sleep 3

# Verificar status
echo -e "\n${BLUE}📊 Status dos Serviços:${NC}\n"

check_service() {
    local name=$1
    local port=$2
    local url=$3
    
    if curl -s "$url" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ $name (http://localhost:$port)${NC}"
    else
        echo -e "${YELLOW}⚠️  $name (http://localhost:$port) - Verificando...${NC}"
    fi
}

check_service "API Gateway" 3000 "http://localhost:3000/api"
check_service "Auth Service" 3001 "http://localhost:3001/auth"
check_service "Gallery Service" 3002 "http://localhost:3002/albums"
check_service "Notification Service" 3003 "http://localhost:3003/notifications"

echo -e "\n${GREEN}✨ Todos os serviços iniciados!${NC}\n"
echo -e "${BLUE}📝 Logs disponíveis em:${NC}"
echo -e "   - logs/auth-service.log"
echo -e "   - logs/gallery-service.log"
echo -e "   - logs/notification-service.log"
echo -e "   - logs/api-gateway.log"
echo -e "\n${BLUE}🛑 Para parar todos os serviços:${NC}"
echo -e "   ./stop-microservices.sh"
echo -e "\n${BLUE}🌐 Acesse:${NC}"
echo -e "   - API Gateway: http://localhost:3000/api"
echo -e "   - Frontend: http://localhost:5173"
echo -e "\n${YELLOW}💡 Dica: Use 'tail -f logs/<service>.log' para ver logs em tempo real${NC}\n"

# Manter script rodando
echo -e "${YELLOW}Pressione Ctrl+C para parar todos os serviços...${NC}\n"

# Trap para parar serviços ao sair
cleanup() {
    echo -e "\n${YELLOW}Parando serviços...${NC}"
    ./stop-microservices.sh
    exit 0
}

trap cleanup INT TERM

# Aguardar indefinidamente
while true; do
    sleep 1
done
