# Setup dos Microserviços - Photo For You

## 🌐 Demonstração

Acesse a aplicação em produção: **[https://photo.resolveup.com.br/](https://photo.resolveup.com.br/)**

## ✅ Repositórios Criados

1. **Auth Service**: https://github.com/GutierrezHenrique/photo-for-you-auth-service
2. **Gallery Service**: https://github.com/GutierrezHenrique/photo-for-you-gallery-service

## 📁 Estrutura Criada

### Auth Service (`/auth-service`)
- ✅ `package.json` - Dependências configuradas
- ✅ `prisma/schema.prisma` - Schema com tabela users e campos de recuperação
- ✅ `Dockerfile` - Configurado para porta 3001
- ✅ `.github/workflows/ci-cd.yml` - CI/CD pipeline
- ✅ `tsconfig.json`, `nest-cli.json` - Configurações TypeScript/NestJS
- ✅ `README.md` - Documentação

### Gallery Service (`/gallery-service`)
- ⏳ A ser criado (mesma estrutura, porta 3002)

## 🔄 Próximos Passos

### 1. Completar Auth Service

Copiar e adaptar do backend atual:
- `src/auth/*` - Módulo de autenticação completo
- `src/users/*` - Módulo de usuários
- `src/database/*` - Apenas repositórios de auth/users
- `src/security/*` - Utilitários de segurança
- `src/logging/*` - Sistema de logging
- `src/main.ts` - Adaptado para porta 3001
- `src/app.module.ts` - Sem módulos de albums/photos

**Adicionar funcionalidades:**
- `POST /auth/forgot-password` - Geração de token de reset
- `POST /auth/reset-password` - Redefinição de senha
- `POST /auth/verify-email` - Verificação de email
- `POST /auth/validate` - Validação de token para outros serviços
- Serviço de email (SendGrid/AWS SES)

### 2. Criar Gallery Service

Copiar e adaptar do backend atual:
- `src/albums/*` - Módulo de álbuns
- `src/photos/*` - Módulo de fotos
- `src/storage/*` - Armazenamento R2/S3
- `src/database/*` - Apenas repositórios de albums/photos
- `src/security/*` - Utilitários de segurança
- `src/logging/*` - Sistema de logging
- `src/main.ts` - Adaptado para porta 3002
- `src/app.module.ts` - Sem módulos de auth/users

**Adaptar:**
- Remover dependência direta de User entity
- Validar tokens via HTTP call ao Auth Service
- Usar `userId` do payload JWT

### 3. Configurar Comunicação

**Auth Service:**
```typescript
// src/auth/auth.controller.ts
@Post('validate')
async validateToken(@Headers('authorization') auth: string) {
  // Validar e retornar dados do usuário
}
```

**Gallery Service:**
```typescript
// src/auth/auth-client.service.ts
@Injectable()
export class AuthClientService {
  constructor(private httpService: HttpService) {}
  
  async validateToken(token: string): Promise<User> {
    // Fazer requisição ao Auth Service
  }
}
```

### 4. Configurar Bancos de Dados

**Auth Database:**
```env
AUTH_DATABASE_URL=postgresql://user:pass@host:5432/auth_db
```

**Gallery Database:**
```env
GALLERY_DATABASE_URL=postgresql://user:pass@host:5432/gallery_db
```

### 5. Docker Compose

Criar `docker-compose.yml` na raiz com:
- auth-db (porta 5433)
- gallery-db (porta 5434)
- auth-service (porta 3001)
- gallery-service (porta 3002)

## 📝 Comandos Úteis

### Auth Service
```bash
cd auth-service
pnpm install
pnpm prisma:generate
pnpm prisma:migrate
pnpm start:dev
```

### Gallery Service
```bash
cd gallery-service
pnpm install
pnpm prisma:generate
pnpm prisma:migrate
pnpm start:dev
```

## 🚀 Deploy

Cada serviço tem seu próprio CI/CD que:
1. Roda testes
2. Builda a aplicação
3. Gera imagem Docker
4. Faz push para GHCR

## 📚 Documentação Adicional

Veja `MICROSERVICES.md` para detalhes da arquitetura.
