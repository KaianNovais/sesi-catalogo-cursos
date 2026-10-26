# Camada de apresentação (React)

## Antes de criar um componente

Procure em `components/`. Já existem: AccessibilityMenu (botão + painel de preferências), Accordion,
Button/ButtonLink, Carousel, CourseCard (com CourseCardSkeleton e AllCoursesCard), FeatureList, FormField
(SearchField, SelectField), Icon, IconButton, Logo, MediaFrame, SectionHeading, Skeleton, SkipLinks (atalhos do
eMAG), StateMessage, StatusBadge, Tag/CategoryTag, TestimonialCard e TestimonialsSection. Estenda com prop ou variante em vez de duplicar. Passo a passo: `/novo-componente`.

## Onde cada coisa mora

- `components/<Nome>/<Nome>.tsx` + `<Nome>.module.css`: reutilizável, só recebe props (não busca dados).
- `features/<feature>/`: a página e as peças usadas só por ela. Se uma peça passar a ser usada por duas
  features, mova-a para `components/`.
- `layouts/` (RootLayout, SiteLayout, Header, Footer), `hooks/` (hooks de UI), `content/` (textos
  institucionais fictícios) e `utils/`. O único `ScrollRestoration` fica no RootLayout (raiz do site e do
  AVA); quem troca só os parâmetros da URL sem querer voltar ao topo usa `preventScrollReset`.
- `accessibility/`: preferências do menu "Acessibilidade" (modelo, estado e o carregador do VLibras). Mudou uma
  chave, valor ou atributo `data-*`? Atualize também o script inline do `index.html` (há teste comparando).
- Dados só pelos hooks de `queries/courseQueries.ts` (`useCourseList`, `useCourseDetails`,
  `useCourseFilterOptions`); o repositório vem de `useDependencies()`. Nada de `fetch` em componente.
- URLs só por `routes/paths.ts` (`paths`, `coursePath`, `learningPath`, `infoPath`). Página nova: módulo
  lazy em `routes/routeModules.ts` + rota em `src/app/router.tsx`. Alvos dos atalhos ("Ir para…") em
  `routes/anchors.ts`.
- Ícone novo entra no registro `components/Icon/icons.ts`.

## Toda tela que busca dados tem quatro estados

Carregando (skeleton com a altura do conteúdo final, para não gerar CLS), erro (`StateMessage` com
`role="alert"`), vazio (`StateMessage`) e sucesso.

## Acessibilidade mínima

- HTML semântico antes de ARIA; um `h1` por página, sem pular níveis de título.
- Todo controle tem nome acessível; ícone decorativo com `aria-hidden`; imagem decorativa com `alt=""`.
- Tudo funciona por teclado, com foco visível; nada depende só de hover.
- Mudanças assíncronas são anunciadas (`role="status"`, `aria-live`); carregamento usa `aria-busy`.
- Movimento respeita `prefers-reduced-motion` e a opção do menu (`accessibility/motion.ts` no JS; CSS global).
- Toda tela precisa funcionar com as preferências do menu "Acessibilidade" (README §10): alto contraste,
  texto a 150% e espaçamento ampliado, além de `forced-colors`. Fundo ou sombra que carrega informação (barra
  de progresso, opção marcada, contorno de card) precisa de regra em `:global(html[data-contrast='high'])` e
  em `@media (forced-colors: active)` no módulo do componente.
- Elemento fixo ou sticky novo não pode esconder o foco (use `scroll-padding`) e sai do caminho em telas
  baixas (`@media (max-height: 30rem)`), como o cabeçalho e a barra de matrícula.
