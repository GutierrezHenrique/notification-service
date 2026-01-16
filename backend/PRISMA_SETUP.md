# Configuração do Prisma

Este projeto foi migrado para usar Prisma como ORM, mantendo o Prisma isolado do restante da aplicação através do padrão Repository.

## Instalação

1. Instale as dependências usando pnpm:
```bash
pnpm install
```

2. Configure a variável de ambiente `DATABASE_URL` no seu arquivo `.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mygallery?schema=public"
```

Ou usando as variáveis existentes:
```env
DATABASE_URL="postgresql://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}?schema=public"
```

## Comandos do Prisma

- `pnpm prisma:generate` - Gera o cliente Prisma
- `pnpm prisma:migrate` - Cria e aplica migrações
- `pnpm prisma:studio` - Abre o Prisma Studio para visualizar os dados
- `pnpm prisma:deploy` - Aplica migrações em produção

## Primeira execução

1. Gere o cliente Prisma:
```bash
pnpm prisma:generate
```

2. Crie a primeira migração:
```bash
pnpm prisma:migrate
```

3. Inicie o servidor:
```bash
pnpm start:dev
```

## Estrutura

- `prisma/schema.prisma` - Schema do banco de dados
- `src/database/` - Módulo de banco de dados isolado
  - `prisma.service.ts` - Serviço do Prisma
  - `database.module.ts` - Módulo que exporta os repositórios
  - `repositories/` - Implementações Prisma dos repositórios
- `src/*/repositories/` - Interfaces abstratas dos repositórios

O restante da aplicação não conhece o Prisma, apenas as interfaces dos repositórios.
