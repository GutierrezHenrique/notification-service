# Guia de Testes - MyGallery Backend

Este documento descreve a estratégia de testes e como executá-los.

## 📊 Cobertura de Código

O projeto está configurado para manter **80% de cobertura** de código em:
- Statements (declarações)
- Branches (ramificações)
- Functions (funções)
- Lines (linhas)

## 🧪 Executando Testes

### Todos os testes
```bash
pnpm test
```

### Testes em modo watch
```bash
pnpm test:watch
```

### Testes com cobertura
```bash
pnpm test:cov
```

### Testes E2E
```bash
pnpm test:e2e
```

## 📁 Estrutura de Testes

```
backend/
├── src/
│   └── **/*.spec.ts          # Testes unitários
├── test/
│   ├── setup.ts              # Configuração global
│   ├── fixtures/              # Dados de teste
│   └── mocks/                 # Mocks reutilizáveis
└── coverage/                  # Relatórios de cobertura
```

## 🎯 Tipos de Testes

### 1. Testes Unitários
Testam componentes isolados:
- Services
- Use Cases
- Repositórios
- Guards
- Interceptors
- Pipes

### 2. Testes de Integração
Testam a interação entre componentes:
- Controllers
- Módulos completos

## 📝 Exemplos de Testes

### Teste de Service
```typescript
describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<UsersRepository>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should create a user', async () => {
    // Test implementation
  });
});
```

### Teste de Use Case
```typescript
describe('CreateAlbumUseCase', () => {
  it('should create an album', async () => {
    // Test implementation
  });
});
```

## 🔧 Mocks e Fixtures

### Fixtures
Dados de teste reutilizáveis em `test/fixtures/`:
- `user.fixture.ts`
- `album.fixture.ts`
- `photo.fixture.ts`

### Mocks
Mocks reutilizáveis em `test/mocks/`:
- `prisma.mock.ts`

## ✅ Boas Práticas

1. **Isolamento**: Cada teste deve ser independente
2. **Arrange-Act-Assert**: Estrutura clara dos testes
3. **Nomes Descritivos**: Nomes que descrevem o comportamento
4. **Mocks Apropriados**: Mock apenas o necessário
5. **Cobertura**: Focar em lógica de negócio, não em getters/setters

## 📈 Metas de Cobertura

- **Services**: 100%
- **Use Cases**: 100%
- **Repositories**: 90%+
- **Controllers**: 80%+
- **Guards/Interceptors**: 80%+

## 🚀 CI/CD

Os testes são executados automaticamente em:
- Pull Requests
- Commits para main
- Deploy

## 🔍 Debugging

Para debugar testes:
```bash
pnpm test:debug
```

## 📚 Recursos

- [Jest Documentation](https://jestjs.io/)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
