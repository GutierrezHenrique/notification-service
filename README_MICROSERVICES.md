# 🚀 Guia Rápido - Microserviços em Modo Debug

## Início Rápido

### 1. Pré-requisitos
```bash
# Instalar pnpm se não tiver
npm install -g pnpm

# Verificar PostgreSQL e Redis
# PostgreSQL deve estar rodando na porta 5432
# Redis deve estar rodando na porta 6379
```

### 2. Iniciar Todos os Serviços

#### Opção A: Script Automático (Background)
```bash
./start-microservices.sh
```
Serviços rodam em background, logs em `logs/`

#### Opção B: Modo Debug (Janelas Separadas)
```bash
./start-microservices-debug.sh
```
Cada serviço abre em uma janela de terminal separada

#### Opção C: Manual (4 Terminais)
```bash
# Terminal 1
cd auth-service && pnpm start:dev

# Terminal 2
cd gallery-service && pnpm start:dev

# Terminal 3
cd notification-service && pnpm start:dev

# Terminal 4
cd api-gateway && pnpm start:dev
```

### 3. Parar Serviços

```bash
# Se usou script automático
./stop-microservices.sh

# Se usou modo debug ou manual
# Pressione Ctrl+C em cada terminal
```

## 📋 Checklist de Configuração

- [ ] PostgreSQL instalado e rodando
- [ ] Redis instalado e rodando (ou via Docker)
- [ ] Bancos de dados criados:
  - `auth_db`
  - `gallery_db`
  - `notification_db`
- [ ] Arquivos `.env` criados em cada serviço
- [ ] Dependências instaladas (`pnpm install` em cada serviço)
- [ ] Prisma Clients gerados (`pnpm prisma:generate`)

## 🔍 Verificar Status

```bash
# API Gateway
curl http://localhost:3000/api

# Auth Service
curl http://localhost:3001/auth

# Gallery Service
curl http://localhost:3002/albums

# Notification Service
curl http://localhost:3003/notifications
```

## 📚 Documentação Completa

- `DEVELOPMENT.md` - Guia completo de desenvolvimento
- `API_GATEWAY.md` - Documentação do API Gateway
- `MIGRATION_GUIDE.md` - Guia de migração do código
- `MICROSERVICES_STATUS.md` - Status da migração
