# Configuração do Cloudflare R2 para Armazenamento de Fotos

Este projeto usa Cloudflare R2 para armazenar as fotos, mantendo o R2 isolado do restante da aplicação através do padrão Repository.

## Pré-requisitos

1. Conta no Cloudflare
2. Bucket R2 criado no Cloudflare
3. API Token com permissões de leitura/escrita no R2

## Instalação

1. Instale as dependências usando pnpm:
```bash
pnpm install
```

2. Instale o SDK AWS S3 (compatível com R2):
```bash
pnpm add @aws-sdk/client-s3
```

## Configuração

### 1. Criar Bucket no Cloudflare R2

1. Acesse o [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Vá em **R2** > **Create bucket**
3. Escolha um nome para o bucket (ex: `mygallery-photos`)
4. Selecione a localização (região)

### 2. Criar API Token

1. No Cloudflare Dashboard, vá em **R2** > **Manage R2 API Tokens**
2. Clique em **Create API Token**
3. Configure:
   - **Token name**: `mygallery-r2-token`
   - **Permissions**: Object Read & Write
   - **TTL**: Opcional (deixe em branco para não expirar)
4. Copie o **Access Key ID** e **Secret Access Key**

### 3. Configurar Variáveis de Ambiente

Adicione as seguintes variáveis no seu arquivo `.env`:

```env
# Cloudflare R2 Configuration
R2_ACCOUNT_ID=seu-account-id-aqui
R2_ACCESS_KEY_ID=seu-access-key-id-aqui
R2_SECRET_ACCESS_KEY=seu-secret-access-key-aqui
R2_BUCKET_NAME=mygallery-photos
R2_PUBLIC_URL=https://seu-dominio.com/r2
```

### Como encontrar o Account ID

1. No Cloudflare Dashboard, vá em **R2**
2. O Account ID aparece no topo da página ou na URL do dashboard

### Configurar URL Pública (Opcional)

Para servir as imagens diretamente do R2, você pode:

1. **Opção 1: Usar Custom Domain**
   - Configure um domínio customizado no R2
   - Use esse domínio como `R2_PUBLIC_URL`

2. **Opção 2: Usar Cloudflare Workers**
   - Crie um Worker que proxy as requisições para o R2
   - Use a URL do Worker como `R2_PUBLIC_URL`

3. **Opção 3: Usar URL padrão do R2**
   - Se não configurar `R2_PUBLIC_URL`, será usada a URL padrão do R2
   - Nota: URLs padrão do R2 podem ter limitações de acesso público

## Estrutura

- `src/storage/repositories/storage.repository.ts` - Interface abstrata do storage
- `src/storage/repositories/r2-storage.repository.ts` - Implementação R2
- `src/storage/storage.module.ts` - Módulo de storage

O restante da aplicação não conhece o R2, apenas a interface `StorageRepository`.

## Funcionalidades

- ✅ Upload de fotos para R2
- ✅ Deleção de fotos do R2
- ✅ Geração de URLs públicas
- ✅ Suporte a diferentes pastas (folder)
- ✅ Isolamento completo do R2

## Testando

Após configurar as variáveis de ambiente:

1. Inicie o servidor:
```bash
pnpm start:dev
```

2. Faça upload de uma foto através da API
3. Verifique no Cloudflare R2 Dashboard se o arquivo foi criado

## Troubleshooting

### Erro: "R2 configuration is missing"
- Verifique se todas as variáveis de ambiente estão configuradas
- Certifique-se de que o arquivo `.env` está sendo carregado

### Erro: "Access Denied"
- Verifique se o Access Key ID e Secret Access Key estão corretos
- Confirme que o token tem permissões de Read & Write

### Arquivos não aparecem no R2
- Verifique os logs do servidor para erros
- Confirme que o bucket name está correto
- Verifique se a conta R2 está ativa

## Custos

O Cloudflare R2 oferece:
- **10 GB de armazenamento grátis**
- **1 milhão de operações Class A (write) grátis por mês**
- **10 milhões de operações Class B (read) grátis por mês**

Consulte a [página de preços](https://developers.cloudflare.com/r2/pricing/) para mais detalhes.
