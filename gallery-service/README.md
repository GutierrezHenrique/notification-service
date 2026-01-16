# Photo For You - Gallery Service

Microserviço de gerenciamento de álbuns e fotos para a aplicação MyGallery.

## 🌐 Demonstração

Acesse a aplicação em produção: **[https://photo.resolveup.com.br/](https://photo.resolveup.com.br/)**

## 🎯 Responsabilidades

Este microserviço é responsável por:
- Gerenciamento de álbuns de fotos
- Upload e armazenamento de fotos
- Compartilhamento público de álbuns
- Processamento de imagens (EXIF, cores dominantes)
- Geração de URLs assinadas para acesso às fotos

## 🏗️ Arquitetura

- **Framework**: NestJS
- **Banco de Dados**: PostgreSQL (próprio banco de dados)
- **ORM**: Prisma
- **Storage**: Cloudflare R2 (S3-compatible)
- **Autenticação**: Validação de tokens via Auth Service
- **Porta**: 3002

## 📦 Instalação

```bash
pnpm install
```

## 🔧 Configuração

Crie um arquivo `.env` com as seguintes variáveis:

```env
# Database
GALLERY_DATABASE_URL="postgresql://user:password@localhost:5432/gallery_db"

# Auth Service (para validação de tokens)
AUTH_SERVICE_URL=http://localhost:3001
JWT_SECRET=your-secret-key

# Application
PORT=3002
NODE_ENV=development

# Storage (Cloudflare R2)
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=your-bucket-name
R2_PUBLIC_URL=https://your-domain.com

# CORS
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173

# Rate Limiting
THROTTLE_TTL=60000
THROTTLE_LIMIT=100

# File Upload
MAX_FILE_SIZE=10485760
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

### Álbuns
- `GET /albums` - Listar álbuns do usuário
- `POST /albums` - Criar álbum
- `GET /albums/:id` - Obter álbum
- `PATCH /albums/:id` - Atualizar álbum
- `DELETE /albums/:id` - Deletar álbum
- `PATCH /albums/:id/share` - Compartilhar/descompartilhar álbum
- `GET /albums/shared/:shareToken` - Obter álbum compartilhado (público)

### Fotos
- `POST /albums/:albumId/photos` - Upload de foto
- `GET /albums/:albumId/photos` - Listar fotos do álbum
- `GET /photos/:id` - Obter foto
- `PATCH /photos/:id` - Atualizar foto
- `DELETE /photos/:id` - Deletar foto

## 🔐 Segurança

- Validação de tokens JWT via Auth Service
- Validação de entrada com class-validator
- Rate limiting com @nestjs/throttler
- Headers de segurança com Helmet
- CORS configurado
- Validação de arquivos (tipo, tamanho, assinatura)
- Sanitização de caminhos de arquivo

## 🔄 Comunicação com Auth Service

Este serviço valida tokens JWT fazendo requisições HTTP ao Auth Service:

```typescript
// Exemplo de validação
GET http://auth-service:3001/auth/validate
Headers: Authorization: Bearer <token>
```

## 🐳 Docker

```bash
# Build
docker build -t photo-for-you-gallery-service .

# Run
docker run -p 3002:3002 --env-file .env photo-for-you-gallery-service
```

## 📝 Licença

UNLICENSED
