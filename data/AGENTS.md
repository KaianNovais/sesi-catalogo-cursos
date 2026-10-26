# Dados fictícios (seed)

`courses.seed.json` é a única fonte dos dados do catálogo: o front usa como mock
(`inMemoryCourseRepository`) e o back-end vai usar como seed do banco. Não copie esses dados para outro lugar.

- Tudo é fictício (exigência do edital): sem nomes reais de pessoas, empresas ou contatos.
- Mínimos do edital: 6 cursos, 3 categorias, 2 modalidades e 3 status, com cargas horárias, módulos,
  aulas e públicos-alvo variados. `frontend/src/infrastructure/course/inMemoryCourseRepository.test.ts`
  verifica as quantidades: rode `npm run test` em `frontend/` depois de editar.
- Referências: `categoryId` → `categories[].id`; `modalityCode` → `modalities[].code`;
  `statusCode` → `statuses[].code`. Os filtros na URL usam `categories[].slug` e os `code`.
- `slug` em kebab-case e único. `imageUrl` = `/images/courses/<slug>.webp`: curso novo precisa de um
  recorte em `frontend/scripts/optimize-images.mjs`.
- `availableFrom` em ISO 8601 (`AAAA-MM-DD`) ou `null` quando não se aplica.
- Campos e tipos: README §8 (modelo de dados). Campo novo exige atualizar DTO, mapeador e README juntos.
- `search-cases.json`: casos de busca que o mock do front e a API precisam responder igual (testados nos
  dois lados). Mudou a busca ou os nomes dos cursos? Atualize os casos.
