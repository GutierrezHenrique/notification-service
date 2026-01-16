# Status dos Requisitos - Photo For You

## ✅ Implementado

### Funcionalidades Core
- ✅ **Detecção automática da cor predominante da foto enviada**
  - Implementado usando Sharp no backend
  - Cor é calculada e armazenada no banco
  - Exibida na interface (lista e detalhes)

- ✅ **Detecção automática da data/hora de aquisição a partir dos metadados (EXIF)**
  - Implementado usando exif-parser
  - Extrai DateTimeOriginal ou DateTime dos metadados
  - Fallback para data fornecida ou data atual

- ✅ **Validação do mime-type do arquivo**
  - FileValidationPipe valida MIME type
  - Validação de assinatura de arquivo (magic numbers)
  - Suporta: JPEG, PNG, GIF, WEBP

- ✅ **Uso de Docker**
  - Dockerfile configurado para backend
  - docker-compose.yml para desenvolvimento
  - GitHub Actions com build e push para GHCR

- ✅ **Drag-and-drop para upload de fotos**
  - Implementado com react-dropzone
  - Suporta arrastar e soltar arquivos

- ✅ **Ordenação das fotos por ordem de aquisição (crescente ou decrescente)**
  - Implementado com query param `orderBy`
  - Botão na interface para alternar ordenação

- ✅ **Upload de múltiplos arquivos**
  - Dropzone atualizado para suportar múltiplos arquivos
  - Upload sequencial de múltiplas fotos

- ✅ **Paginação de itens**
  - Implementado paginação para fotos
  - Query params: `page` e `limit`
  - Controles de navegação na interface

## ❌ Não Implementado (Ainda)

### Funcionalidades Pendentes
- ❌ **Formulário de recuperação de senha com envio de link por e-mail**
  - Requer serviço de email (SendGrid, AWS SES, etc)
  - Endpoints: POST /auth/forgot-password, POST /auth/reset-password
  - Geração de token de reset

- ❌ **Validação de preenchimento em todos os campos de entrada**
  - Parcialmente implementado (validações básicas existem)
  - Faltam validações mais robustas (número, data, formato específico)

- ❌ **Autenticação/Cadastro com provedor terceiro (Google, Facebook, Github, Apple)**
  - Requer Passport strategies para OAuth
  - Configuração de credenciais OAuth

- ❌ **Possibilidade de compartilhar o link de um álbum de fotos como público**
  - Requer campo `isPublic` e `shareToken` no modelo Album
  - Endpoint público para visualizar álbum compartilhado
  - Geração de token único por álbum

- ❌ **Upload de pasta inteira**
  - Atualmente suporta múltiplos arquivos, mas não pastas
  - Requer webkitdirectory no input HTML5

- ❌ **Microsserviços**
  - Aplicação atual é monolítica
  - Requer arquitetura distribuída

- ❌ **Serverless**
  - Aplicação atual roda em servidor tradicional
  - Requer adaptação para AWS Lambda, Vercel Functions, etc

## 📝 Notas

- Validações básicas existem mas podem ser expandidas
- Algumas funcionalidades podem ser implementadas incrementalmente
- Microsserviços e Serverless são decisões arquiteturais maiores
