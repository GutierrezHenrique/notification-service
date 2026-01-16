# Photo For You - Auth Service

Microserviço de autenticação e gerenciamento de usuários para a aplicação MyGallery.

## 🌐 Demonstração

Acesse a aplicação em produção: **[https://photo.resolveup.com.br/](https://photo.resolveup.com.br/)**

## 🎯 Responsabilidades

Este microserviço é responsável por:
- Autenticação de usuários (login, registro)
- Gerenciamento de contas de usuários
- Recuperação de senha
- Verificação de email
- Geração e validação de tokens JWT
- Validação de usuários para outros serviços

## 🏗️ Arquitetura

- **Framework**: NestJS
- **Banco de Dados**: PostgreSQL (próprio banco de dados)
- **ORM**: Prisma
- **Autenticação**: JWT + Passport
- **Porta**: 3001

## 📦 Instalação

```bash
pnpm install
```

## 🔧 Configuração

Crie um arquivo `.env` com as seguintes variáveis:

```env
# Database
AUTH_DATABASE_URL="postgresql://user:password@localhost:5432/auth_db"

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# Application
PORT=3001
NODE_ENV=development

# Email (para recuperação de senha)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@mygallery.com
SMTP_FROM_NAME=MyGallery
FRONTEND_URL=http://localhost:5173

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

### Autenticação
- `POST /auth/register` - Registrar novo usuário
- `POST /auth/login` - Login
- `POST /auth/refresh` - Renovar token
- `POST /auth/validate` - Validar token

### Usuários
- `GET /users/me` - Obter dados do usuário atual
- `PATCH /users/me` - Atualizar perfil
- `DELETE /users/me` - Deletar conta

### Recuperação de Senha
- `POST /auth/forgot-password` - Solicitar recuperação de senha
- `POST /auth/reset-password` - Redefinir senha com token

### Verificação de Email
- `POST /auth/verify-email` - Verificar email
- `POST /auth/resend-verification` - Reenviar email de verificação

## 🔐 Segurança

- Validação de entrada com class-validator
- Rate limiting com @nestjs/throttler
- Headers de segurança com Helmet
- CORS configurado
- Senhas hasheadas com bcrypt
- Tokens JWT com expiração

## 🐳 Docker

```bash
# Build
docker build -t photo-for-you-auth-service .

# Run
docker run -p 3001:3001 --env-file .env photo-for-you-auth-service
```

## 📝 Licença

UNLICENSED
