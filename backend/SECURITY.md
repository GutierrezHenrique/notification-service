# Guia de Segurança - MyGallery

Este documento descreve as medidas de segurança implementadas na aplicação seguindo as melhores práticas do mercado.

## 🔒 Medidas de Segurança Implementadas

### 1. Headers de Segurança (Helmet)

- **Content Security Policy (CSP)**: Previne XSS attacks
- **X-Content-Type-Options**: Previne MIME type sniffing
- **X-Frame-Options**: Previne clickjacking
- **X-XSS-Protection**: Proteção adicional contra XSS
- **Referrer-Policy**: Controla informações de referrer
- **Permissions-Policy**: Restringe recursos do navegador

### 2. Rate Limiting e Throttling

- **Throttler Global**: Limita requisições por IP/usuário
- **Throttling por Rota**: Limites específicos para endpoints sensíveis
- **Upload de Arquivos**: Limite de 5 uploads por minuto por usuário

**Configuração padrão:**
- 100 requisições por minuto (global)
- 10 requisições por minuto (endpoints específicos)
- 5 uploads por minuto (fotos)

### 3. Validação e Sanitização

- **Class Validator**: Validação de entrada em todos os DTOs
- **Class Transformer**: Transformação e sanitização automática
- **Sanitização de Strings**: Remove caracteres perigosos
- **Validação de Arquivos**: 
  - Verificação de tipo MIME
  - Verificação de extensão
  - Verificação de assinatura de arquivo (magic numbers)
  - Limite de tamanho

### 4. CORS Configurado

- **Origins Permitidos**: Configurável via variáveis de ambiente
- **Credentials**: Permitido apenas para origens confiáveis
- **Métodos Permitidos**: Apenas métodos necessários
- **Headers Permitidos**: Lista restrita de headers

### 5. Autenticação e Autorização

- **JWT Tokens**: Autenticação stateless
- **Password Hashing**: Bcrypt com salt rounds
- **Guards**: Proteção de rotas sensíveis
- **Role-based Access**: Sistema de roles (preparado para expansão)

### 6. Logging de Segurança

- **Security Logging Interceptor**: Registra todas as requisições
- **Informações Registradas**:
  - IP do cliente
  - User-Agent
  - Método HTTP
  - URL
  - Usuário autenticado
  - Tempo de resposta
  - Erros

### 7. Proteção de Dados

- **Sanitize Interceptor**: Remove campos sensíveis das respostas
- **Password Obfuscation**: Senhas nunca são retornadas
- **Data Transformation**: Dados são transformados antes de serem enviados

### 8. Validação de Arquivos

- **File Validation Pipe**: Validação robusta de uploads
- **Magic Number Verification**: Verifica assinatura do arquivo
- **MIME Type Validation**: Valida tipo MIME real
- **Size Limits**: Limite configurável de tamanho
- **Extension Validation**: Valida extensão do arquivo

### 9. Compression

- **Gzip Compression**: Reduz tamanho das respostas
- **Melhora Performance**: Reduz uso de banda

### 10. Trust Proxy

- **Proxy Configuration**: Configurado para funcionar atrás de proxy reverso
- **Rate Limiting**: Funciona corretamente com proxies

## 📋 Variáveis de Ambiente de Segurança

```env
# Rate Limiting
THROTTLE_TTL=60000          # Tempo em ms (1 minuto)
THROTTLE_LIMIT=100          # Limite de requisições

# CORS
CORS_ORIGIN=http://localhost:5173,https://yourdomain.com
FRONTEND_URL=http://localhost:5173

# File Upload
MAX_FILE_SIZE=10485760      # 10MB em bytes

# Environment
NODE_ENV=production         # production, development, test
```

## 🛡️ Boas Práticas Implementadas

### 1. Input Validation
- ✅ Todos os inputs são validados
- ✅ Whitelist de campos permitidos
- ✅ Rejeição de campos não permitidos
- ✅ Transformação automática de tipos

### 2. Output Sanitization
- ✅ Campos sensíveis removidos
- ✅ Sanitização de strings
- ✅ Proteção contra vazamento de dados

### 3. Error Handling
- ✅ Mensagens de erro genéricas em produção
- ✅ Logging detalhado de erros
- ✅ Não exposição de stack traces

### 4. File Upload Security
- ✅ Validação de tipo MIME
- ✅ Validação de extensão
- ✅ Verificação de assinatura de arquivo
- ✅ Limite de tamanho
- ✅ Rate limiting específico

### 5. Authentication Security
- ✅ Tokens JWT com expiração
- ✅ Passwords hasheados com bcrypt
- ✅ Guards em rotas protegidas
- ✅ Validação de tokens

## 🔍 Monitoramento

### Logs de Segurança

Todos os eventos de segurança são registrados:
- Tentativas de acesso
- Uploads de arquivos
- Erros de autenticação
- Requisições bloqueadas por rate limiting

### Métricas Recomendadas

1. **Taxa de Erro 429** (Too Many Requests)
2. **Tentativas de Upload Inválidas**
3. **Falhas de Autenticação**
4. **Requisições Bloqueadas por CORS**

## 🚨 Resposta a Incidentes

### Em caso de ataque:

1. **Verificar Logs**: Analisar logs de segurança
2. **Bloquear IPs**: Adicionar IPs maliciosos à blacklist
3. **Ajustar Rate Limits**: Reduzir limites temporariamente
4. **Notificar Usuários**: Se dados foram comprometidos

## 📚 Recursos Adicionais

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NestJS Security Best Practices](https://docs.nestjs.com/security/authentication)
- [Helmet Documentation](https://helmetjs.github.io/)
- [Rate Limiting Best Practices](https://www.cloudflare.com/learning/bots/what-is-rate-limiting/)

## 🔄 Atualizações de Segurança

- **Dependências**: Atualizar regularmente
- **CVE Monitoring**: Monitorar vulnerabilidades conhecidas
- **Security Patches**: Aplicar patches rapidamente
- **Code Reviews**: Revisar código para vulnerabilidades

## ⚠️ Checklist de Segurança

Antes de fazer deploy em produção:

- [ ] Todas as variáveis de ambiente configuradas
- [ ] CORS configurado corretamente
- [ ] Rate limits ajustados para produção
- [ ] Logs de segurança habilitados
- [ ] HTTPS configurado
- [ ] Secrets não commitados no código
- [ ] Dependências atualizadas
- [ ] Testes de segurança executados
- [ ] Backup de dados configurado
- [ ] Plano de resposta a incidentes definido
