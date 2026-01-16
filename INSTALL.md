# Guia de Instalação - MyGallery

## Pré-requisitos

- Node.js 18 ou superior
- PostgreSQL 15 ou superior
- npm ou yarn

## Instalação Passo a Passo

### 1. Clone o repositório (se aplicável)

```bash
cd MyGallery
```

### 2. Configurar o Backend

```bash
cd backend
npm install
```

Crie o arquivo `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=sua_senha
DB_DATABASE=mygallery

JWT_SECRET=seu-secret-key-aqui
JWT_EXPIRES_IN=7d

PORT=3000
NODE_ENV=development

MAX_FILE_SIZE=10485760
UPLOAD_DEST=./uploads
```

### 3. Configurar o Banco de Dados

Certifique-se de que o PostgreSQL está rodando e crie o banco de dados:

```sql
CREATE DATABASE mygallery;
```

### 4. Iniciar o Backend

```bash
npm run start:dev
```

O backend estará disponível em `http://localhost:3000`

### 5. Configurar o Frontend

Em um novo terminal:

```bash
cd frontend
npm install
```

Crie o arquivo `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env`:

```env
VITE_API_URL=http://localhost:3000
```

### 6. Iniciar o Frontend

```bash
npm run dev
```

O frontend estará disponível em `http://localhost:5173`

## Usando Docker

### Opção 1: Apenas Banco de Dados

```bash
docker-compose up -d postgres
```

Depois configure o backend para usar `localhost` como host do banco.

### Opção 2: Backend + Banco de Dados

```bash
docker-compose up -d
```

O backend estará disponível em `http://localhost:3000`

## Primeiro Uso

1. Acesse `http://localhost:5173`
2. Clique em "Cadastre-se"
3. Preencha o formulário de cadastro
4. Faça login
5. Crie seu primeiro álbum
6. Adicione fotos ao álbum

## Troubleshooting

### Erro de conexão com o banco

- Verifique se o PostgreSQL está rodando
- Confirme as credenciais no arquivo `.env`
- Verifique se o banco de dados foi criado

### Erro de upload de arquivos

- Certifique-se de que a pasta `backend/uploads` existe
- Verifique as permissões da pasta

### Erro de CORS

- Verifique se a URL da API no frontend está correta
- Confirme que o backend está rodando na porta 3000

## Ambiente de Teste

Para usar o ambiente de teste, use o arquivo `.env.test`:

```bash
# Backend
cp .env.test .env

# Frontend
cp .env.test .env
```

Certifique-se de que o banco de dados de teste está configurado corretamente.
