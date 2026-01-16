# API Gateway - Photo For You

## 🎯 Visão Geral

O API Gateway é o ponto de entrada único para todos os microserviços. Ele roteia requisições para os serviços apropriados e centraliza autenticação, rate limiting e logging.

## 📡 Rotas

### Autenticação (`/api/auth`)
- `POST /api/auth/register` → Auth Service
- `POST /api/auth/login` → Auth Service
- `POST /api/auth/forgot-password` → Auth Service
- `POST /api/auth/reset-password` → Auth Service
- `POST /api/auth/verify-email` → Auth Service
- `POST /api/auth/refresh` → Auth Service
- `POST /api/auth/validate` → Auth Service (interno)

### Usuários (`/api/users`)
- `GET /api/users/me` → Auth Service
- `PATCH /api/users/me` → Auth Service

### Álbuns (`/api/albums`)
- `GET /api/albums` → Gallery Service
- `POST /api/albums` → Gallery Service
- `GET /api/albums/:id` → Gallery Service
- `PATCH /api/albums/:id` → Gallery Service
- `DELETE /api/albums/:id` → Gallery Service
- `PATCH /api/albums/:id/share` → Gallery Service
- `GET /api/albums/shared/:shareToken` → Gallery Service (público)
- `POST /api/albums/:albumId/photos` → Gallery Service (upload)
- `GET /api/albums/:albumId/photos` → Gallery Service

### Fotos (`/api/photos`)
- `GET /api/photos/search` → Gallery Service
- `GET /api/photos/:id` → Gallery Service
- `PATCH /api/photos/:id` → Gallery Service
- `DELETE /api/photos/:id` → Gallery Service

### Notificações (`/api/notifications`)
- `GET /api/notifications` → Notification Service
- `GET /api/notifications/unread` → Notification Service
- `PATCH /api/notifications/:id/read` → Notification Service
- `PATCH /api/notifications/read-all` → Notification Service
- `DELETE /api/notifications/:id` → Notification Service
- `DELETE /api/notifications` → Notification Service

### Preferências (`/api/preferences`)
- `GET /api/preferences` → Notification Service
- `PATCH /api/preferences` → Notification Service

## 🔐 Autenticação

O API Gateway valida tokens JWT fazendo uma requisição ao Auth Service:

```typescript
POST /auth/validate
Body: { token: "..." }
```

Se válido, o `userId` é extraído e anexado ao request para uso pelos serviços downstream.

## 📦 Upload de Arquivos

Para uploads de fotos, o API Gateway:
1. Recebe o arquivo via `multipart/form-data`
2. Extrai o arquivo usando `FileInterceptor`
3. Cria um novo `FormData` com o arquivo
4. Encaminha para o Gallery Service

## 🚀 Execução

```bash
# Desenvolvimento
pnpm start:dev

# Produção
pnpm build
pnpm start:prod
```

## 🔧 Variáveis de Ambiente

```env
PORT=3000
AUTH_SERVICE_URL=http://localhost:3001
GALLERY_SERVICE_URL=http://localhost:3002
NOTIFICATION_SERVICE_URL=http://localhost:3003
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173
THROTTLE_TTL=60000
THROTTLE_LIMIT=100
```

## 📝 Notas

- O prefixo `/api` é adicionado globalmente
- Todas as rotas protegidas usam `JwtAuthGuard`
- Rate limiting é aplicado globalmente
- CORS está configurado para o frontend
- Headers de segurança (Helmet) estão ativos
