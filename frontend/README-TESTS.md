# Testes - Frontend

Este projeto usa Jest e React Testing Library para testes.

## Executando Testes

```bash
# Executar todos os testes
npm test

# Executar em modo watch
npm run test:watch

# Executar com coverage
npm run test:coverage
```

## Estrutura de Testes

Os testes estão organizados em:

```
src/
├── components/
│   ├── ui/
│   │   └── __tests__/     # Testes dos componentes UI
│   └── __tests__/         # Testes de outros componentes
├── pages/
│   └── __tests__/         # Testes das páginas
├── hooks/
│   └── __tests__/         # Testes dos hooks
├── api/
│   └── __tests__/         # Testes das chamadas de API
└── services/
    └── __tests__/         # Testes dos serviços
```

## Componentes Testados

- ✅ Button
- ✅ Input
- ✅ Modal
- ✅ Loading
- ✅ Alert
- ✅ CreateAlbumModal
- ✅ Login

## Hooks Testados

- ✅ useAlbums
- ✅ useAlbum
- ✅ useCreateAlbum

## Serviços Testados

- ✅ API Service
- ✅ Auth Store

## Configuração

O Jest está configurado em `jest.config.ts` com:

- TypeScript support
- jsdom environment
- Module path mapping
- CSS/Asset mocks
- Coverage reports

## Adicionando Novos Testes

1. Crie um arquivo `*.test.tsx` ou `*.test.ts` próximo ao código testado
2. Use React Testing Library para componentes
3. Use Jest para funções e hooks
4. Mantenha os testes simples e focados

## Exemplo de Teste

```typescript
import { render, screen } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('should render button', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})
```
