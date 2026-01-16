# Arquitetura de Microserviços - Photo For You

## 🌐 Demonstração

Acesse a aplicação em produção: **[https://photo.resolveup.com.br/](https://photo.resolveup.com.br/)**

## 📐 Visão Geral

A aplicação foi dividida em três microserviços independentes, cada um com seu próprio banco de dados:

1. **Auth Service** - Autenticação e gerenciamento de usuários
2. **Gallery Service** - Gerenciamento de álbuns e fotos
3. **Notification Service** - Gerenciamento e envio de notificações

## 🔐 Auth Service (Porta 3001)

**Repositório**: https://github.com/GutierrezHenrique/photo-for-you-auth-service

### Responsabilidades
- Registro de usuários
- Autenticação (login/logout)
- Geração e validação de tokens JWT
- Recuperação de senha
- Verificação de email
- Gerenciamento de perfil de usuário

### Banco de Dados
- **Database**: `auth_db` (PostgreSQL)
- **Tabelas**: `users` (com campos de reset de senha e verificação de email)

### Endpoints Principais
- `POST /auth/register` - Registrar novo usuário
- `POST /auth/login` - Login
- `POST /auth/forgot-password` - Solicitar recuperação de senha
- `POST /auth/reset-password` - Redefinir senha
- `POST /auth/verify-email` - Verificar email
- `GET /users/me` - Obter dados do usuário atual
- `PATCH /users/me` - Atualizar perfil
- `POST /auth/validate` - Validar token (para outros serviços)

## 🔔 Notification Service (Porta 3003)

**Repositório**: https://github.com/GutierrezHenrique/photo-for-you-notification-service

### Responsabilidades
- Gerenciamento de notificações do sistema
- Envio de notificações por email
- Preferências de notificação por usuário
- Fila de processamento (Bull Queue)
- Histórico de notificações

### Banco de Dados
- **Database**: `notification_db` (PostgreSQL)
- **Tabelas**: `notifications`, `notification_preferences`

### Endpoints Principais
- `GET /notifications` - Listar notificações
- `GET /notifications/unread` - Contar não lidas
- `PATCH /notifications/:id/read` - Marcar como lida
- `PATCH /notifications/read-all` - Marcar todas como lidas
- `DELETE /notifications/:id` - Deletar notificação
- `GET /preferences` - Obter preferências
- `PATCH /preferences` - Atualizar preferências
- `POST /webhooks/album-shared` - Webhook para álbum compartilhado
- `POST /webhooks/photo-uploaded` - Webhook para foto enviada

## 🖼️ Gallery Service (Porta 3002)

**Repositório**: https://github.com/GutierrezHenrique/photo-for-you-gallery-service

### Responsabilidades
- Gerenciamento de álbuns
- Upload e gerenciamento de fotos
- Compartilhamento de álbuns
- Armazenamento de arquivos (R2/S3)

### Banco de Dados
- **Database**: `gallery_db` (PostgreSQL)
- **Tabelas**: `albums`, `photos`

### Endpoints Principais
- `GET /albums` - Listar álbuns do usuário
- `POST /albums` - Criar álbum
- `GET /albums/:id` - Obter álbum
- `PATCH /albums/:id` - Atualizar álbum
- `DELETE /albums/:id` - Deletar álbum
- `PATCH /albums/:id/share` - Compartilhar álbum
- `GET /albums/shared/:shareToken` - Obter álbum compartilhado
- `POST /albums/:albumId/photos` - Upload de foto
- `GET /albums/:albumId/photos` - Listar fotos
- `DELETE /photos/:id` - Deletar foto

## 🔄 Comunicação Entre Serviços

### Validação de Token
O Gallery Service valida tokens JWT fazendo uma requisição ao Auth Service:

```
GET /auth/validate
Headers: Authorization: Bearer <token>
```

### Sincronização de Usuários
- O Gallery Service não armazena dados de usuários
- Quando necessário, valida o token e obtém o `userId` do payload JWT
- O `userId` é usado como referência nos álbuns e fotos

## 🗄️ Estrutura de Bancos de Dados

### Auth Database (auth_db)
```sql
users
  - id (UUID)
  - email (unique)
  - password (hashed)
  - name
  - password_reset_token
  - password_reset_expires
  - email_verification_token
  - email_verified
  - created_at
  - updated_at
```

### Gallery Database (gallery_db)
```sql
albums
  - id (UUID)
  - title
  - description
  - user_id (UUID - referência ao Auth Service)
  - is_public
  - share_token
  - created_at
  - updated_at

photos
  - id (UUID)
  - title
  - description
  - filename
  - original_name
  - mime_type
  - size
  - acquisition_date
  - dominant_color
  - album_id (UUID)
  - created_at
  - updated_at
```

### Notification Database (notification_db)
```sql
notifications
  - id (UUID)
  - user_id (UUID - referência ao Auth Service)
  - type (string)
  - title
  - message
  - read (boolean)
  - read_at (timestamp)
  - metadata (JSON)
  - created_at
  - updated_at

notification_preferences
  - id (UUID)
  - user_id (UUID - unique, referência ao Auth Service)
  - email_enabled (boolean)
  - system_enabled (boolean)
  - album_shared (boolean)
  - photo_uploaded (boolean)
  - weekly_digest (boolean)
  - created_at
  - updated_at
```

## 🚀 Deploy

### Variáveis de Ambiente

#### Auth Service
```env
AUTH_DATABASE_URL=postgresql://user:pass@host:5432/auth_db
JWT_SECRET=secret
JWT_EXPIRES_IN=24h
PORT=3001
GALLERY_SERVICE_URL=http://gallery-service:3002
```

#### Gallery Service
```env
GALLERY_DATABASE_URL=postgresql://user:pass@host:5432/gallery_db
AUTH_SERVICE_URL=http://auth-service:3001
PORT=3002
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...
```

#### Notification Service
```env
NOTIFICATION_DATABASE_URL=postgresql://user:pass@host:5432/notification_db
REDIS_HOST=redis
REDIS_PORT=6379
AUTH_SERVICE_URL=http://auth-service:3001
PORT=3003
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM=noreply@mygallery.com
```

## 📦 Docker Compose (Desenvolvimento)

```yaml
version: '3.8'

services:
  auth-db:
    image: postgres:15
    environment:
      POSTGRES_DB: auth_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5433:5432"

  gallery-db:
    image: postgres:15
    environment:
      POSTGRES_DB: gallery_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5434:5432"

  notification-db:
    image: postgres:15
    environment:
      POSTGRES_DB: notification_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5435:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  auth-service:
    build: ./auth-service
    ports:
      - "3001:3001"
    environment:
      AUTH_DATABASE_URL: postgresql://postgres:postgres@auth-db:5432/auth_db
      JWT_SECRET: dev-secret
      PORT: 3001
    depends_on:
      - auth-db

  gallery-service:
    build: ./gallery-service
    ports:
      - "3002:3002"
    environment:
      GALLERY_DATABASE_URL: postgresql://postgres:postgres@gallery-db:5432/gallery_db
      AUTH_SERVICE_URL: http://auth-service:3001
      PORT: 3002
    depends_on:
      - gallery-db
      - auth-service

  notification-service:
    build: ./notification-service
    ports:
      - "3003:3003"
    environment:
      NOTIFICATION_DATABASE_URL: postgresql://postgres:postgres@notification-db:5432/notification_db
      REDIS_HOST: redis
      REDIS_PORT: 6379
      AUTH_SERVICE_URL: http://auth-service:3001
      PORT: 3003
      SMTP_HOST: smtp.gmail.com
      SMTP_PORT: 587
      SMTP_USER: ${SMTP_USER}
      SMTP_PASS: ${SMTP_PASS}
      SMTP_FROM: noreply@mygallery.com
    depends_on:
      - notification-db
      - redis
      - auth-service
```

## 🔒 Segurança

- Cada serviço tem seu próprio rate limiting
- Tokens JWT são validados entre serviços
- CORS configurado para cada serviço
- Headers de segurança (Helmet) em ambos
- Validação de entrada em todos os endpoints

## 📝 Próximos Passos

1. Implementar message queue (RabbitMQ/Redis) para comunicação assíncrona
2. Adicionar API Gateway (Kong/Nginx)
3. Implementar service discovery
4. Adicionar monitoring e logging centralizado
5. Implementar circuit breaker para resiliência
