# Front-end — React 19 + Vite 8 + TypeScript 6

## Camadas (Clean Architecture)

As dependências apontam para dentro: `domain` ← `application` ← `infrastructure` / `presentation`.
`src/app/` é a raiz de composição (router, providers, injeção de dependências em
`createDependencies.ts`, estilos globais); `src/shared/` só tem utilitários puros.
Aliases: `@/` = `src/`, `@data/` = `../data/`.

- `src/domain/` — entidades, regras e portas, em TypeScript puro → `src/domain/AGENTS.md`
- `src/application/` — casos de uso que recebem o repositório por parâmetro (`listCourses`,
  `getCourseDetails`, `getCourseFilterOptions`)
- `src/infrastructure/` — adaptadores: HTTP, mock em memória, variáveis de ambiente → `src/infrastructure/AGENTS.md`
- `src/presentation/` — React: componentes, páginas, queries e rotas → `src/presentation/AGENTS.md`

## Armadilhas da stack

- O React Compiler está ativo: não use `useMemo`, `useCallback` nem `memo` por desempenho.
- React 19: `ref` é uma prop comum (sem `forwardRef`); `<title>` e `<meta>` ficam no componente da página.
- React Router 8 em data mode: `createBrowserRouter` vem de `react-router`; `RouterProvider`, de `react-router/dom`.
- `noUncheckedIndexedAccess` está ligado: `lista[i]` é `T | undefined`. Trate o caso; não use `!`.
- Os filtros do catálogo vivem na URL (`useCatalogFilters`); não os duplique em estado local.
- No modo mock (padrão em dev), `?simularErro` em qualquer URL força o estado de erro e
  `VITE_MOCK_LATENCY_MS` define a latência simulada.
- Modo `http` local: basta `VITE_API_MODE=http` no `.env.local` (sem URL). O Vite repassa `/api` para a
  API em <http://localhost:5080> (`vite.config.ts`), na mesma origem e sem CORS, como na publicação.
- O ESLint não tem `jsx-a11y` (incompatível com o ESLint 10): a acessibilidade depende de revisão
  (subagente `revisor-codigo`, `/auditoria-lighthouse`).
- `.env.development`, `.env.production` e `.env.example` são versionados e públicos (variáveis `VITE_`
  vão para o bundle): nunca coloque segredo neles. Configuração pessoal fica em `.env.local`.

## Imagens e fontes

- Imagem de curso = `public/images/courses/<slug>.webp` (1200 px) + `<slug>-600.webp`, geradas por
  `npm run images:optimize -- "<pasta dos PNGs>" ["<pasta das fotos do Figma>"]`. Os 6 cursos do
  Figma usam as fotos originais do protótipo, recortadas para reproduzir o enquadramento dos cards.
  Curso novo exige uma entrada nova em `scripts/optimize-images.mjs`.
- Os caminhos de imagem são absolutos (`/images/...`): o app precisa ser publicado na raiz do domínio.
- Publicação: `npm run build:firebase` (modo `.env.firebase`; o `firebase deploy` roda sozinho). A CSP do
  `firebase.json` libera os scripts inline do `index.html` por hash: mudou um deles? Atualize o hash
  (o `scripts/verify-csp.mjs` mostra o valor certo e faz o build falhar enquanto não bater).
- A Open Sans é self-hosted (`public/fonts`), com fallback de métricas ajustadas em
  `src/app/styles/fonts.css` (CLS 0). Não troque por Google Fonts.
- A imagem do hero é pré-carregada por um script inline no `index.html` (só na rota `/`). Mudou o
  hero? Atualize esse script.
- No catálogo, só o primeiro card tem `priority` (foto sem lazy e com `fetchpriority="high"`: é o LCP
  no celular) e, com a área do catálogo < 40rem, os cards do 5º em diante usam
  `content-visibility: auto`. Mais fotos com prioridade, ou sem essa regra, disputam banda com a do
  primeiro card e o Lighthouse mobile cai de 90 para 87.
- No modo mock, mantenha `preload: true` no repositório em `src/app/createDependencies.ts`: os dados
  começam a baixar junto com o app. Sem isso, a foto do primeiro card só é pedida depois do chunk da
  página e do chunk dos dados, em sequência, e o catálogo mobile cai para 89.

## Orçamento de qualidade

- Lighthouse mobile: desempenho ≥ 90; acessibilidade, boas práticas e SEO = 100; CLS 0 (README §9).
- Nenhum overflow horizontal de 320 px a 1920 px, nem com o celular deitado (844×390).

Convenções de testes e de CSS: `.claude/rules/testes.md` e `.claude/rules/estilos.md`. O Claude Code
as carrega sozinho ao abrir esses arquivos; outros agentes devem lê-las antes de editar testes ou CSS.
