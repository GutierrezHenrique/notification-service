# Guia de Desenvolvimento - Microserviços

## 🚀 Iniciando os Microserviços em Modo Debug

### Pré-requisitos

1. **Node.js 18+** e **pnpm** instalados
2. **PostgreSQL** rodando localmente (ou via Docker apenas para DB)
3. **Redis** rodando localmente (ou via Docker apenas para Redis)

### Opção 1: Script Automático (Recomendado)

#### Linux/macOS
```bash
./start-microservices.sh
```

#### Windows (PowerShell)
```powershell
.\start-microservices.ps1
```

O script irá:
- ✅ Verificar dependências
- ✅ Criar arquivos `.env` se não existirem
- ✅ Instalar dependências automaticamente
- ✅ Gerar Prisma Clients
- ✅ Iniciar todos os serviços em modo debug
- ✅ Mostrar status de cada serviço

### Opção 2: Manual

#### 1. Configurar Bancos de Dados

Crie os bancos de dados no PostgreSQL:

```sql
CREATE DATABASE auth_db;
CREATE DATABASE gallery_db;
CREATE DATABASE notification_db;
```

Ou use Docker apenas para os bancos:

```bash
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:15
docker run -d -p 6379:6379 redis:7-alpine
```

#### 2. Configurar Variáveis de Ambiente

Crie arquivos `.env` em cada serviço (veja exemplos abaixo).

#### 3. Instalar Dependências

```bash
# Auth Service
cd auth-service
pnpm install
pnpm prisma:generate
cd ..

# Gallery Service
cd gallery-service
pnpm install
pnpm prisma:generate
cd ..

# Notification Service
cd notification-service
pnpm install
pnpm prisma:generate
cd ..

# API Gateway
cd api-gateway
pnpm install
cd ..
```

#### 4. Rodar Migrations

```bash
# Auth Service
cd auth-service
pnpm prisma:migrate dev
cd ..

# Gallery Service
cd gallery-service
pnpm prisma:migrate dev
cd ..

# Notification Service
cd notification-service
pnpm prisma:migrate dev
cd ..
```

#### 5. Iniciar Serviços (em terminais separados)

**Terminal 1 - Auth Service:**
```bash
cd auth-service
pnpm start:dev
```

**Terminal 2 - Gallery Service:**
```bash
cd gallery-service
pnpm start:dev
```

**Terminal 3 - Notification Service:**
```bash
cd notification-service
pnpm start:dev
```

**Terminal 4 - API Gateway:**
```bash
cd api-gateway
pnpm start:dev
```

## 📝 Arquivos .env de Exemplo

### auth-service/.env
```env
AUTH_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/auth_db?schema=public"
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRES_IN=24h
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173
THROTTLE_TTL=60000
THROTTLE_LIMIT=100
```

### gallery-service/.env
```env
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
```

### notification-service/.env
```env
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
```

### api-gateway/.env
```env
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
```

## 🛑 Parando os Serviços

### Script Automático
```bash
# Linux/macOS
./stop-microservices.sh

# Windows
.\stop-microservices.ps1
```

### Manual
Pressione `Ctrl+C` em cada terminal ou mate os processos:

```bash
# Encontrar processos Node.js nas portas
lsof -ti:3000 | xargs kill
lsof -ti:3001 | xargs kill
lsof -ti:3002 | xargs kill
lsof -ti:3003 | xargs kill
```

## 🐛 Debug

### Ver Logs

Os scripts salvam logs em `logs/`:
```bash
tail -f logs/auth-service.log
tail -f logs/gallery-service.log
tail -f logs/notification-service.log
tail -f logs/api-gateway.log
```

### Modo Debug do Node.js

Para iniciar com debugger:

```bash
# Auth Service
cd auth-service
node --inspect-brk -r ts-node/register node_modules/.bin/nest start

# Outros serviços seguem o mesmo padrão
```

Depois conecte o debugger na porta padrão (9229) ou configure portas diferentes.

### Verificar Status

```bash
# Verificar se serviços estão rodando
curl http://localhost:3000/api
curl http://localhost:3001/auth
curl http://localhost:3002/albums
curl http://localhost:3003/notifications
```

## 📊 Portas

- **3000** - API Gateway
- **3001** - Auth Service
- **3002** - Gallery Service
- **3003** - Notification Service
- **5173** - Frontend (Vite)
- **5432** - PostgreSQL
- **6379** - Redis

## 🔧 Troubleshooting

### Porta já em uso
```bash
# Ver qual processo está usando a porta
lsof -i :3000

# Matar processo
kill -9 <PID>
```

### Erro de conexão com banco
- Verifique se PostgreSQL está rodando
- Verifique se os bancos foram criados
- Verifique a string de conexão no `.env`

### Erro de conexão com Redis
- Verifique se Redis está rodando: `redis-cli ping`
- Ou use Docker: `docker run -d -p 6379:6379 redis:7-alpine`

### Prisma Client não gerado
```bash
cd <service>
pnpm prisma:generate
```

### Dependências não instaladas
```bash
cd <service>
pnpm install
```

## 💡 Dicas

1. Use `pnpm start:dev` para hot-reload automático
2. Use `pnpm start:debug` para modo debug com breakpoints
3. Configure seu IDE para debugar cada serviço separadamente
4. Use `console.log` ou logger para debug (logs aparecem nos arquivos de log)
5. Monitore os logs em tempo real com `tail -f`
