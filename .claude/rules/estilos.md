---
paths:
  - "frontend/src/**/*.css"
---

# CSS (CSS Modules + design tokens)

- Cores, espaçamentos, raios e tipografia vêm de `src/app/styles/tokens.css` (`var(--...)`). Valor novo
  que se repete vira token; não espalhe hex ou px soltos.
- Mobile-first. Componente que muda com a largura usa container query (`container-type: inline-size`
  no próprio componente); media query só para layout de página e tokens globais.
- Breakpoints em `rem` (40, 48 e 64rem são os usados); tipografia fluida pelos tokens com `clamp()`.
  Container query em `rem` acompanha o texto ampliado pelo menu "Acessibilidade"; media query não.
- Grade sem colunas explícitas usa `grid-template-columns: minmax(0, 1fr)`: com texto ampliado, palavra longa
  quebra em vez de alargar a coluna. Não use `white-space: nowrap` em rótulos que podem crescer.
- Hover só dentro de `@media (hover: hover)`. Nunca remova o foco visível (`:focus-visible` em `base.css`).
- Modos de contraste: o alto contraste do site é `html[data-contrast='high']` (folha global em
  `accessibility.css`; exceções no módulo com `:global(...)`) e o do sistema é `@media (forced-colors: active)`.
  Onde só sombra ou cor de fundo separa ou informa algo, dê borda/contorno nesses dois modos.
- Resets e estilos globais usam `:where()` para não disputar especificidade com os módulos
  (ex.: `:where(ul, ol)[role='list']`). A exceção é `accessibility.css`: as preferências do usuário precisam
  vencer os módulos e usam `!important` de propósito.
- Altura de tela com `svh`/`dvh`; bordas do aparelho com `env(safe-area-inset-*)` (`viewport-fit=cover`).
- Animações e rolagem suave já são neutralizadas por `prefers-reduced-motion` em `base.css`.
- Evite `text-wrap: balance`: muda as quebras de linha em relação ao Figma. Só use onde o resultado for
  idêntico ao protótipo (hoje, o título do hero).
- Referência visual: frame de 1366 px do Figma com área útil de 1150 px (`--container-max`).
