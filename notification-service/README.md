# Photo For You - Notification Service

Microserviço de notificações para a aplicação MyGallery.

## 🌐 Demonstração

Acesse a aplicação em produção: **[https://photo.resolveup.com.br/](https://photo.resolveup.com.br/)**

## 🎯 Responsabilidades

Este microserviço é responsável por:
- Gerenciamento de notificações do sistema
- Envio de notificações por email
- Preferências de notificação por usuário
- Fila de processamento de notificações (Bull Queue)
- Histórico de notificações

## 🏗️ Arquitetura

- **Framework**: NestJS
- **Banco de Dados**: PostgreSQL (próprio banco de dados)
- **ORM**: Prisma
- **Queue**: Bull (Redis)
- **Email**: Nodemailer
- **Autenticação**: Validação de tokens via Auth Service
- **Porta**: 3003

## 📦 Instalação

```bash
pnpm install
```

## 🔧 Configuração

Crie um arquivo `.env` com as seguintes variáveis:

```env
# Database
NOTIFICATION_DATABASE_URL="postgresql://user:password@localhost:5432/notification_db"

# Redis (para Bull Queue)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Auth Service (para validação de tokens)
AUTH_SERVICE_URL=http://localhost:3001
JWT_SECRET=your-secret-key

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
```

## 🚀 Execução

### Desenvolvimento
```bash
pnpm start:dev
```

### Produção
```bash
pnpm build
pnpm start:prod
```

## 🧪 Testes

```bash
# Executar todos os testes
pnpm test

# Executar testes com cobertura
pnpm test:cov

# Executar testes em modo watch
pnpm test:watch
```

## 📊 Banco de Dados

### Migrations

```bash
# Criar nova migration
pnpm prisma:migrate

# Aplicar migrations em produção
pnpm prisma:deploy

# Abrir Prisma Studio
pnpm prisma:studio
```

## 🔌 API Endpoints

### Notificações
- `GET /notifications` - Listar notificações do usuário
- `GET /notifications/unread` - Contar notificações não lidas
- `GET /notifications/:id` - Obter notificação específica
- `PATCH /notifications/:id/read` - Marcar como lida
- `PATCH /notifications/read-all` - Marcar todas como lidas
- `DELETE /notifications/:id` - Deletar notificação
- `DELETE /notifications` - Deletar todas as notificações

### Preferências
- `GET /preferences` - Obter preferências do usuário
- `PATCH /preferences` - Atualizar preferências

### Webhooks (para outros serviços)
- `POST /webhooks/album-shared` - Notificar compartilhamento de álbum
- `POST /webhooks/photo-uploaded` - Notificar upload de foto
- `POST /webhooks/send-email` - Enviar email customizado

## 📧 Tipos de Notificações

- `system` - Notificações do sistema
- `album_shared` - Álbum compartilhado
- `photo_uploaded` - Nova foto adicionada
- `email` - Notificação por email
- `weekly_digest` - Resumo semanal

## 🔐 Segurança

- Validação de tokens JWT via Auth Service
- Validação de entrada com class-validator
- Rate limiting com @nestjs/throttler
- Headers de segurança com Helmet
- CORS configurado

## 🔄 Comunicação com Outros Serviços

### Receber Webhooks
Outros serviços podem enviar notificações via webhook:

```typescript
POST /webhooks/album-shared
{
  "userId": "user-id",
  "albumId": "album-id",
  "albumTitle": "Meu Álbum"
}
```

### Validação de Token
Este serviço valida tokens JWT fazendo requisições HTTP ao Auth Service:

```
GET http://auth-service:3001/auth/validate
Headers: Authorization: Bearer <token>
```

## 🐳 Docker

```bash
# Build
docker build -t photo-for-you-notification-service .

# Run
docker run -p 3003:3003 --env-file .env photo-for-you-notification-service
```

## 📝 Licença

UNLICENSED
