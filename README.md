# MyGallery - Galeria de Fotos

Aplicação web responsiva para gerenciamento de álbuns de fotos, desenvolvida com React.js (Vite) e NestJS (Node.js).

## 🌐 Demonstração

Acesse a aplicação em produção: **[https://photo.resolveup.com.br/](https://photo.resolveup.com.br/)**

## 🚀 Tecnologias

### Backend
- **NestJS** - Framework Node.js
- **TypeORM** - ORM para banco de dados
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação
- **Sharp** - Processamento de imagens
- **EXIF Parser** - Extração de metadados de imagens

### Frontend
- **React 18** - Biblioteca JavaScript
- **Vite** - Build tool
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS
- **React Router** - Roteamento
- **Zustand** - Gerenciamento de estado
- **React Hook Form** - Formulários
- **React Dropzone** - Upload de arquivos

## 📋 Funcionalidades

- ✅ Cadastro e autenticação de usuários
- ✅ Criação e gerenciamento de álbuns
- ✅ Upload de fotos com drag-and-drop
- ✅ Visualização em tabela ou miniaturas
- ✅ Detecção automática de cor predominante
- ✅ Extração automática de data/hora dos metadados EXIF
- ✅ Edição de álbuns e fotos
- ✅ Exclusão de fotos e álbuns (com validações)
- ✅ Validação de tipos de arquivo (MIME type)
- ✅ Interface responsiva e moderna

## 🛠️ Instalação

### Pré-requisitos
- Node.js 18+
- PostgreSQL 15+
- npm ou yarn

### Backend

```bash
cd backend
npm install
```

Crie um arquivo `.env` baseado no `.env.example`:

```bash
cp .env.example .env
```

Configure as variáveis de ambiente no arquivo `.env`:

```env
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=mygallery

JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d

PORT=3000
NODE_ENV=development

MAX_FILE_SIZE=10485760
UPLOAD_DEST=./uploads
```

Execute as migrações (TypeORM criará as tabelas automaticamente):

```bash
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
```

Crie um arquivo `.env` baseado no `.env.example`:

```bash
cp .env.example .env
```

Configure a URL da API:

```env
VITE_API_URL=http://localhost:3000
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

## 🐳 Docker

Para executar com Docker Compose:

```bash
docker-compose up -d
```

Isso iniciará:
- PostgreSQL na porta 5432
- Backend na porta 3000

O frontend ainda precisa ser executado localmente ou você pode adicionar um serviço no docker-compose.

## 📁 Estrutura do Projeto

```
MyGallery/
├── backend/
│   ├── src/
│   │   ├── auth/          # Módulo de autenticação
│   │   ├── users/         # Módulo de usuários
│   │   ├── albums/        # Módulo de álbuns
│   │   ├── photos/        # Módulo de fotos
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── uploads/           # Diretório de uploads
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── pages/         # Páginas
│   │   ├── services/      # Serviços API
│   │   ├── store/         # Estado global
│   │   └── App.tsx
│   └── package.json
└── docker-compose.yml
```

## 🔐 Autenticação

A aplicação usa JWT (JSON Web Tokens) para autenticação. O token é armazenado no localStorage e enviado em todas as requisições autenticadas.

## 📝 API Endpoints

### Autenticação
- `POST /auth/register` - Registrar novo usuário
- `POST /auth/login` - Login

### Usuários
- `GET /users/me` - Obter perfil do usuário autenticado

### Álbuns
- `GET /albums` - Listar álbuns do usuário
- `GET /albums/:id` - Obter álbum específico
- `POST /albums` - Criar novo álbum
- `PATCH /albums/:id` - Atualizar álbum
- `DELETE /albums/:id` - Excluir álbum (apenas se vazio)

### Fotos
- `GET /albums/:albumId/photos` - Listar fotos do álbum
- `GET /albums/:albumId/photos/:id` - Obter foto específica
- `POST /albums/:albumId/photos` - Upload de foto
- `PATCH /albums/:albumId/photos/:id` - Atualizar foto
- `DELETE /albums/:albumId/photos/:id` - Excluir foto

## 🧪 Testes

Para executar testes do backend:

```bash
cd backend
npm run test
```

Para ambiente de teste, use o arquivo `.env.test`:

```bash
NODE_ENV=test npm run start:dev
```

## 🎨 Características Implementadas

### Obrigatórias
- ✅ Cadastro e autenticação
- ✅ CRUD de álbuns
- ✅ CRUD de fotos
- ✅ Upload de arquivos
- ✅ Visualização em tabela e miniaturas
- ✅ Validações de formulários

### Bônus
- ✅ Tailwind CSS para UI moderna
- ✅ Validação de campos (número, data, texto, vazio)
- ✅ Detecção automática de cor predominante
- ✅ Detecção automática de data/hora (EXIF)
- ✅ Drag-and-drop para upload
- ✅ Validação de MIME type
- ✅ Docker Compose
- ✅ Clean Code Architecture

## 📄 Licença

Este projeto foi desenvolvido como teste técnico.

## 👤 Autor

Desenvolvido seguindo as melhores práticas de Clean Code e arquitetura modular.
