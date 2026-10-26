# Back-end — .NET 10 + PostgreSQL

API REST somente leitura que implementa o contrato do README §7, o mesmo do mock do front-end.

## Camadas (Clean Architecture: as referências entre projetos impedem dependência no sentido errado)

- `src/CourseCatalog.Domain/` — entidades e regras puras (`CatalogText`: busca sem acento; `Slug`)
- `src/CourseCatalog.Application/` — `CourseCatalogService` (casos de uso), `CourseFilter`, DTOs do
  contrato e a porta `ICourseRepository`
- `src/CourseCatalog.Infrastructure/` — EF Core + Npgsql: `CatalogDbContext`, configurações,
  `Persistence/Migrations`, repositório, seed e permissões do banco
- `src/CourseCatalog.Api/` — endpoints (`Endpoints/`), segurança (`Security/`) e composição (`Program.cs`, `Hosting/`)
- `src/CourseCatalog.DbMigrator/` — migrations, seed e GRANT com o usuário dono; a API nunca escreve no banco

## Comandos (dentro de `backend/`)

- `dotnet build`, `dotnet format --verify-no-changes` e `dotnet test`: juntos equivalem ao `npm run check`.
  **Rode antes de considerar uma tarefa concluída.** `dotnet format` (sem a flag) corrige a formatação.
- Os testes de integração criam e apagam um banco temporário: precisam do PostgreSQL local rodando e do
  `psql` (ou das variáveis `CATALOG_TEST_ADMIN_CONNECTION` e `PSQL`).
- `dotnet run --project src/CourseCatalog.DbMigrator` — migrations + seed + permissões (pode repetir).
- API: servidor `sesi-backend` do `.claude/launch.json` (<http://localhost:5080>); OpenAPI em
  `/openapi/v1.json`, só no ambiente Development.
- Migration nova: `dotnet tool restore` e depois `dotnet ef migrations add <Nome> --project
  src/CourseCatalog.Infrastructure --startup-project src/CourseCatalog.DbMigrator --output-dir
  Persistence/Migrations`. Não edite migrations geradas.

## Publicação (README §11)

- Cloud Run `course-catalog-api` (projeto `sesi-catalogo-cursos`, região `southamerica-east1`), com imagem
  do `Dockerfile` enviada por `gcloud builds submit backend --tag …/course-catalog/api:<versão>`.
- Segredos no Secret Manager: `catalog-api-connection` (API) e `catalog-owner-connection` (migrador).
  Para rodar o migrador em produção, leia o segredo direto para a variável
  `ConnectionStrings__CatalogAdmin`, sem exibi-lo, com `DOTNET_ENVIRONMENT=Production --no-launch-profile`.
- O Firebase chama a API pelo host `…-rj.a.run.app`: ele precisa estar em `AllowedHosts`.
- A tag do SDK no `Dockerfile` (`sdk:10.0.402-noble`) acompanha o `global.json`: mudou um, mude o outro.

## Regras

- Contrato mudou? Atualize junto `Application/Courses/CourseDtos.cs`, o front (`courseDtos.ts`,
  mapeador e mock) e o README §7/§8. Os `ContractTests` comparam a API com o seed.
- Paridade com o mock: busca no nome completo e no breve, sem acento e sem maiúsculas; código
  desconhecido → lista vazia; `featured=false` não filtra.
- Só GET. As respostas são DTOs projetados na consulta, nunca entidades. Erros são ProblemDetails com
  títulos em português e sem detalhes internos.
- SQL só via LINQ. SQL bruto apenas com valores parametrizados (`ExecuteSqlAsync` com interpolação),
  nunca concatenando texto que vem de fora.
- Segredos só em `dotnet user-secrets` (local) ou variável de ambiente (`ConnectionStrings__Catalog`),
  nunca em `appsettings*.json`. O agente não pode ler `~/.microsoft/usersecrets` (deny no settings).
- Configuração nova = classe de opções com `ValidateOnStart`: a API não sobe com configuração inválida.
- Analisadores em `latest-recommended`, com avisos tratados como erro: corrija a causa. Supressão só com
  `[SuppressMessage(..., Justification = "...")]`.
- Testes: nomes `Metodo_Comportamento`, `TestContext.Current.CancellationToken` nas chamadas assíncronas
  e `Assert` do xUnit (o FluentAssertions 8 tem licença comercial).
- Pacote novo só se o framework não resolver: versão em `Directory.Packages.props`, licença gratuita e
  build para atualizar os `packages.lock.json`.
