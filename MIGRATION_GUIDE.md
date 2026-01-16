# Guia de Migração para Microserviços

Este documento descreve como migrar o código do backend monolítico para a arquitetura de microserviços.

## 📋 Status da Migração

### ✅ Completado

1. **API Gateway** - Criado e configurado
   - Repositório: https://github.com/GutierrezHenrique/photo-for-you-api-gateway
   - Proxy para todos os serviços
   - Autenticação centralizada
   - Rate limiting global

2. **Estrutura dos Microserviços** - Criada
   - Auth Service: https://github.com/GutierrezHenrique/photo-for-you-auth-service
   - Gallery Service: https://github.com/GutierrezHenrique/photo-for-you-gallery-service
   - Notification Service: https://github.com/GutierrezHenrique/photo-for-you-notification-service

3. **Frontend** - Atualizado
   - Configurado para usar API Gateway (`/api` prefix)
   - Base URL atualizada para `http://localhost:3000/api`

### ⏳ Pendente

1. **Mover código para Auth Service**
2. **Mover código para Gallery Service**
3. **Implementar código do Notification Service**
4. **Testar integração completa**

## 🔄 Migração do Código

### 1. Auth Service

**Arquivos a copiar do `backend/src/`:**

```
auth/
  - auth.controller.ts
  - auth.service.ts
  - auth.module.ts
  - dto/login.dto.ts
  - guards/jwt-auth.guard.ts
  - guards/local-auth.guard.ts
  - strategies/jwt.strategy.ts
  - strategies/local.strategy.ts
  - use-cases/login.use-case.ts
  - use-cases/register.use-case.ts
  - use-cases/validate-user.use-case.ts
  - repositories/auth.repository.ts

users/
  - users.controller.ts
  - users.service.ts
  - users.module.ts
  - dto/create-user.dto.ts
  - repositories/users.repository.ts
  - view-models/user.view-model.ts

database/
  - database.module.ts
  - prisma.service.ts
  - repositories/prisma-auth.repository.ts
  - repositories/prisma-users.repository.ts

domain/entities/
  - user.entity.ts

security/
  - (todos os arquivos de segurança)
```

**Adaptações necessárias:**

1. Remover dependências de `albums` e `photos`
2. Adicionar endpoints de recuperação de senha:
   - `POST /auth/forgot-password`
   - `POST /auth/reset-password`
   - `POST /auth/verify-email`
3. Adicionar endpoint de validação para outros serviços:
   - `POST /auth/validate`
4. Atualizar `app.module.ts` para não incluir AlbumsModule/PhotosModule

### 2. Gallery Service

**Arquivos a copiar do `backend/src/`:**

```
albums/
  - (todos os arquivos)

photos/
  - (todos os arquivos)

storage/
  - (todos os arquivos)

database/
  - database.module.ts
  - prisma.service.ts
  - repositories/prisma-albums.repository.ts
  - repositories/prisma-photos.repository.ts

domain/entities/
  - album.entity.ts
  - photo.entity.ts

security/
  - (todos os arquivos de segurança)
```

**Adaptações necessárias:**

1. Remover dependências de `auth` e `users`
2. Criar serviço de validação de token via HTTP:
   ```typescript
   // src/auth/auth-client.service.ts
   @Injectable()
   export class AuthClientService {
     async validateToken(token: string): Promise<User> {
       // HTTP call to Auth Service
     }
   }
   ```
3. Atualizar guards para usar `AuthClientService`
4. Remover referências diretas à entidade `User`
5. Usar `userId` do payload JWT

### 3. Notification Service

**Criar do zero:**

1. Módulo de notificações
2. Serviço de email (Nodemailer)
3. Processadores de fila (Bull)
4. Controllers e DTOs
5. Integração com outros serviços via webhooks

## 🔧 Configuração do Frontend

O frontend já está configurado para usar o API Gateway:

```typescript
// frontend/src/services/api.ts
baseURL: 'http://localhost:3000/api'
```

Todas as requisições passam pelo API Gateway que roteia para os serviços apropriados.

## 🚀 Ordem de Implementação

1. **Auth Service** (prioridade alta)
   - Copiar código
   - Implementar recuperação de senha
   - Testar endpoints

2. **Gallery Service** (prioridade alta)
   - Copiar código
   - Implementar AuthClientService
   - Testar endpoints

3. **Notification Service** (prioridade média)
   - Implementar do zero
   - Configurar email
   - Testar webhooks

4. **API Gateway** (já feito)
   - Testar roteamento
   - Verificar autenticação

5. **Frontend** (já atualizado)
   - Testar todas as funcionalidades
   - Verificar erros

## 📝 Checklist de Migração

### Auth Service
- [ ] Copiar código de auth/users
- [ ] Remover dependências de albums/photos
- [ ] Implementar recuperação de senha
- [ ] Implementar verificação de email
- [ ] Adicionar endpoint /auth/validate
- [ ] Atualizar schema Prisma
- [ ] Rodar migrations
- [ ] Testar endpoints

### Gallery Service
- [ ] Copiar código de albums/photos/storage
- [ ] Remover dependências de auth/users
- [ ] Criar AuthClientService
- [ ] Atualizar guards
- [ ] Atualizar schema Prisma
- [ ] Rodar migrations
- [ ] Testar endpoints

### Notification Service
- [ ] Criar estrutura de notificações
- [ ] Implementar serviço de email
- [ ] Configurar Bull Queue
- [ ] Criar webhooks
- [ ] Testar envio de emails

### API Gateway
- [x] Criar estrutura
- [x] Implementar proxies
- [ ] Testar roteamento
- [ ] Testar autenticação
- [ ] Testar upload de arquivos

### Frontend
- [x] Atualizar baseURL
- [ ] Testar login/registro
- [ ] Testar CRUD de álbuns
- [ ] Testar upload de fotos
- [ ] Testar compartilhamento

## 🐛 Problemas Conhecidos

1. **Upload de arquivos**: O API Gateway precisa lidar com FormData corretamente
2. **Validação de token**: Gallery Service precisa validar tokens via HTTP
3. **CORS**: Cada serviço precisa ter CORS configurado

## 📚 Recursos

- [NestJS HTTP Module](https://docs.nestjs.com/techniques/http-module)
- [Axios Documentation](https://axios-http.com/)
- [Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)
