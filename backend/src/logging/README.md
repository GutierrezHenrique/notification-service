# Sistema de Logging - MyGallery

Sistema de logging estruturado seguindo as melhores práticas do mercado.

## 📋 Funcionalidades

### 1. Logging Estruturado
- Logs em formato JSON para produção
- Logs coloridos e legíveis para desenvolvimento
- Múltiplos níveis de log (error, warn, info, debug, verbose)

### 2. Tipos de Log

#### Business Actions
Logs automáticos de ações de negócio (CRUD operations):
```typescript
@LogAction('create', 'album', false)
async create() { ... }
```

#### Audit Logs
Logs de auditoria para ações sensíveis:
```typescript
@LogAction('update', 'album', true) // audit = true
async update() { ... }
```

#### HTTP Requests
Logs automáticos de todas as requisições HTTP com:
- Método, URL, Status Code
- Duração da requisição
- IP, User-Agent
- Usuário autenticado

#### Security Events
Logs de eventos de segurança:
```typescript
logger.logSecurityEvent('failed_login', 'medium', { ip, email });
```

#### Performance Metrics
Logs automáticos de operações lentas (>1s)

### 3. Arquivos de Log

Os logs são salvos em `backend/logs/`:
- `error.log` - Apenas erros
- `combined.log` - Todos os logs
- `audit.log` - Logs de auditoria

### 4. Rotação de Logs
- Tamanho máximo: 5MB por arquivo
- Retenção: 5-10 arquivos (dependendo do tipo)
- Rotação automática

## 🎯 Uso

### Decorator @LogAction

```typescript
@Post()
@LogAction('create', 'album', false)
async create() { ... }
```

Parâmetros:
- `action`: Ação sendo realizada (create, update, delete, etc.)
- `resource`: Tipo de recurso (album, photo, user, etc.)
- `audit`: Se deve ser logado no audit.log (padrão: false)

### Logger Service

```typescript
constructor(private readonly logger: AppLoggerService) {}

// Log simples
this.logger.log('User created', 'UsersService', { userId: '123' });

// Log de ação de negócio
this.logger.logAction('create', 'album', 'album-id', 'user-id');

// Log de auditoria
this.logger.logAudit('update', 'user-id', 'album', 'album-id', { changes });

// Log de segurança
this.logger.logSecurityEvent('failed_login', 'medium', { ip, email });

// Log de performance
this.logger.logPerformance('database_query', 1500, { query });
```

## 📊 Estrutura dos Logs

### Log de Ação de Negócio
```json
{
  "timestamp": "2024-01-15 10:30:45",
  "level": "info",
  "message": "Business action",
  "type": "business_action",
  "action": "create",
  "resource": "album",
  "resourceId": "album-123",
  "userId": "user-456",
  "method": "POST",
  "url": "/albums",
  "ip": "192.168.1.1",
  "duration": 150
}
```

### Log de Auditoria
```json
{
  "timestamp": "2024-01-15 10:30:45",
  "level": "info",
  "message": "Audit log",
  "type": "audit",
  "action": "update",
  "userId": "user-456",
  "resource": "album",
  "resourceId": "album-123",
  "changes": { "title": "New Title" },
  "ip": "192.168.1.1"
}
```

### Log HTTP
```json
{
  "timestamp": "2024-01-15 10:30:45",
  "level": "info",
  "message": "HTTP request",
  "type": "http_request",
  "method": "GET",
  "url": "/albums",
  "statusCode": 200,
  "duration": 45,
  "userId": "user-456",
  "ip": "192.168.1.1"
}
```

## ⚙️ Configuração

### Variáveis de Ambiente

```env
# Nível de log (error, warn, info, debug, verbose)
LOG_LEVEL=info

# Ambiente (development, production)
NODE_ENV=production
```

### Desenvolvimento vs Produção

**Desenvolvimento:**
- Logs coloridos no console
- Formato legível
- Nível de log: debug

**Produção:**
- Logs em JSON
- Apenas console e arquivos
- Nível de log: info

## 🔍 Análise de Logs

### Buscar ações de um usuário
```bash
grep "userId.*user-123" logs/combined.log
```

### Buscar erros
```bash
grep "level.*error" logs/error.log
```

### Buscar ações de auditoria
```bash
grep "type.*audit" logs/audit.log
```

### Buscar requisições lentas
```bash
grep "duration.*[1-9][0-9][0-9][0-9]" logs/combined.log
```

## 📈 Integração com Ferramentas

Os logs em formato JSON podem ser facilmente integrados com:
- **ELK Stack** (Elasticsearch, Logstash, Kibana)
- **Datadog**
- **Splunk**
- **CloudWatch** (AWS)
- **Google Cloud Logging**

## 🛡️ Segurança

- Senhas nunca são logadas
- Dados sensíveis são sanitizados
- IPs e User-Agents são registrados para segurança
- Logs de auditoria são imutáveis

## 📝 Boas Práticas

1. **Use @LogAction** para todas as operações CRUD
2. **Use audit=true** para operações sensíveis (update, delete)
3. **Log erros** com contexto completo
4. **Monitore performance** através dos logs
5. **Revise logs regularmente** para identificar problemas
