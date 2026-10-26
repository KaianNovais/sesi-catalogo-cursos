---
paths:
  - "frontend/src/**/*.test.{ts,tsx}"
  - "frontend/src/test/**"
---

# Testes (Vitest + Testing Library)

- O teste fica ao lado do código (`Nome.test.ts(x)`). Ambiente jsdom; `src/test/setup.ts` já simula
  ResizeObserver, IntersectionObserver, matchMedia e scroll.
- Componente ou página que usa dados, rotas ou DI: renderize com `renderWithProviders(ui, { route, path })`
  (`src/test/renderWithProviders.tsx`), que injeta o repositório em memória, o QueryClient e o router.
- Consulte como o usuário: `getByRole`, `getByLabelText`, `findByText`. Evite `getByTestId` e detalhes
  de implementação. Interações com `@testing-library/user-event`.
- Priorize o comportamento exigido pelo edital: busca, filtros combinados, contagem de resultados,
  limpar filtros, estados de carregando, vazio e erro, e abertura dos detalhes.
- Mocks tipados: `vi.fn<typeof fetch>()`. O Vitest já restaura os mocks entre os testes (`restoreMocks`).
- Rodar um arquivo: `npm run test -- src/caminho/arquivo.test.tsx`; todos: `npm run test`.
