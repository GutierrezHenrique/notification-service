# 🚀 Início Rápido - Microserviços em Modo Debug

## ⚡ Início Rápido (3 comandos)

### 1. Preparar Bancos de Dados (se necessário)

**Opção A: Usar Docker apenas para bancos**
```bash
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres --name postgres postgres:15
docker run -d -p 6379:6379 --name redis redis:7-alpine

# Criar bancos
docker exec -it postgres psql -U postgres -c "CREATE DATABASE auth_db;"
docker exec -it postgres psql -U postgres -c "CREATE DATABASE gallery_db;"
docker exec -it postgres psql -U postgres -c "CREATE DATABASE notification_db;"
```

**Opção B: PostgreSQL local**
```sql
CREATE DATABASE auth_db;
CREATE DATABASE gallery_db;
CREATE DATABASE notification_db;
```

### 2. Iniciar Todos os Serviços

```bash
./start-microservices.sh
```

Isso irá:
- ✅ Criar arquivos `.env` automaticamente
- ✅ Instalar dependências
- ✅ Gerar Prisma Clients
- ✅ Iniciar todos os serviços em modo debug

### 3. Parar Serviços

```bash
./stop-microservices.sh
```

## 🐛 Modo Debug com Janelas Separadas

Para ver logs de cada serviço em janelas separadas:

```bash
./start-microservices-debug.sh
```

Cada serviço abrirá em uma janela de terminal separada.

## 📋 Portas dos Serviços

- **3000** - API Gateway (ponto de entrada)
- **3001** - Auth Service
- **3002** - Gallery Service  
- **3003** - Notification Service
- **5173** - Frontend

## 🔍 Verificar se Está Funcionando

```bash
# API Gateway
curl http://localhost:3000/api

# Ver logs
tail -f logs/api-gateway.log
tail -f logs/auth-service.log
```

## 📝 Arquivos Importantes

- `start-microservices.sh` - Inicia todos os serviços (background)
- `start-microservices-debug.sh` - Inicia em janelas separadas
- `stop-microservices.sh` - Para todos os serviços
- `DEVELOPMENT.md` - Guia completo de desenvolvimento

## ⚠️ Troubleshooting

**Porta em uso?**
```bash
lsof -ti:3000 | xargs kill
```

**Erro de banco?**
- Verifique se PostgreSQL está rodando
- Verifique se os bancos foram criados
- Verifique a string de conexão no `.env`

**Dependências não instaladas?**
```bash
cd auth-service && pnpm install
cd ../gallery-service && pnpm install
cd ../notification-service && pnpm install
cd ../api-gateway && pnpm install
```

## 🎯 Próximos Passos

1. Migrar código do backend para os microserviços
2. Testar endpoints via API Gateway
3. Verificar integração com frontend
