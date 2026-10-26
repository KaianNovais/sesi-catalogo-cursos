# Catálogo de Cursos — SESI Indústria (CTED)

Aplicação web para consulta do catálogo de cursos de um ambiente virtual de aprendizagem (Moodle),
desenvolvida para a atividade prática do processo seletivo **Desenvolvedor de Sistemas I**.

> **Aplicação publicada:** <https://sesi-catalogo-cursos.web.app>. Front-end no Firebase Hosting, API .NET 10
> no Google Cloud Run e banco PostgreSQL no Neon, todos em planos gratuitos (seção 11).
> **Repositório:** <https://github.com/KaianNovais/sesi-catalogo-cursos>.

---

## Sumário

1. [Objetivo da aplicação](#1-objetivo-da-aplicação)
2. [Tecnologias utilizadas](#2-tecnologias-utilizadas)
3. [Arquitetura da solução](#3-arquitetura-da-solução)
4. [Estrutura das pastas](#4-estrutura-das-pastas)
5. [Instruções para execução](#5-instruções-para-execução)
6. [Configuração do banco](#6-configuração-do-banco)
7. [Endpoints](#7-endpoints)
8. [Modelo de dados](#8-modelo-de-dados)
9. [Estratégia de responsividade](#9-estratégia-de-responsividade)
10. [Decisões de acessibilidade](#10-decisões-de-acessibilidade)
11. [Processo de publicação](#11-processo-de-publicação)
12. [Diferenças em relação ao Figma](#12-diferenças-em-relação-ao-figma)
13. [Limitações conhecidas e itens não concluídos](#13-limitações-conhecidas-e-itens-não-concluídos)

---

## 1. Objetivo da aplicação

Apresentar o catálogo de cursos do Centro de Tecnologias e Educação Digital (CTED), permitindo que o
usuário **consulte, pesquise e filtre** os cursos e **visualize os detalhes** de cada oferta, seguindo o
protótipo fornecido no Figma.

Funcionalidades obrigatórias implementadas:

| Requisito                                    | Onde                                                                 |
| -------------------------------------------- | -------------------------------------------------------------------- |
| Listar os cursos por meio da API             | `/cursos` e carrossel da página inicial (repositório HTTP ou mock)   |
| Pesquisar pelo nome                          | Campo "Buscar pelo nome" (sem diferenciar acentos/maiúsculas)       |
| Filtrar por categoria, modalidade ou status  | Seletores do catálogo                                                |
| Combinar pesquisa e filtros                  | Todos os critérios são aplicados juntos e ficam na URL              |
| Apresentar a quantidade de resultados        | "8 cursos encontrados" (anunciado por leitores de tela)             |
| Limpar os filtros aplicados                  | Botão "Limpar filtros" (barra de filtros e estado vazio)            |
| Abrir os detalhes de um curso                | Clique no card → `/cursos/:slug`                                     |
| Mensagem quando nenhum curso é encontrado    | Estado vazio com sugestão e atalho para limpar                       |
| Estado de carregamento                       | Skeletons com as mesmas dimensões dos cards                         |
| Mensagem em caso de erro                     | Estado de erro com "Tentar novamente"                                |
| Interface funcional em diferentes telas      | Layout fluido de 320 px a telas largas (ver seção 9)                 |

Extras: página inicial completa do Figma, página de detalhes tematizada pela categoria, regra de negócio de
matrícula por status, e o **AVA (Área do aluno)** do fluxo 03 do protótipo, com navegação por módulos/aulas,
busca de aulas e progresso salvo no navegador.

## 2. Tecnologias utilizadas

### Front-end (`/frontend`)

| Tecnologia                         | Versão | Por quê                                                                      |
| ---------------------------------- | ------ | ---------------------------------------------------------------------------- |
| React                              | 19.3   | Biblioteca de UI; uso de recursos do React 19 (`<title>`/`<meta>` nativos, `ref` como prop, `use`) |
| React Compiler                     | 1.0    | Memoização automática — dispensa `useMemo`/`useCallback` manuais             |
| TypeScript                         | 6.0    | Tipagem estática em modo `strict`                                            |
| Vite                               | 8      | Build e servidor de desenvolvimento                                         |
| React Router                       | 8      | Rotas com carregamento sob demanda (code splitting)                          |
| TanStack Query                     | 5      | Cache, cancelamento e estados de carregamento/erro das requisições          |
| CSS Modules + CSS moderno          | —      | Estilos isolados por componente, design tokens em variáveis CSS, container queries, `clamp()`, `:has()`, `:where()` |
| Open Sans (variável, WOFF2)        | —      | Fonte do protótipo, auto-hospedada (subconjunto latino, 48 KB) com preload e fallback de métricas ajustadas (licença OFL) |
| Vitest + Testing Library + jsdom   | 5 / 16 | Testes unitários e de integração                                             |
| ESLint (+ regras do React Compiler)| 10     | Qualidade e padronização                                                    |
| Prettier                           | 3.9    | Formatação automática e uniforme (também aplicada pelos hooks do Claude Code) |
| sharp                              | 0.35   | Script de otimização das imagens fornecidas (PNG → WebP)                     |

### Back-end (`/backend`)

| Tecnologia                                   | Versão   | Por quê                                                                       |
| -------------------------------------------- | -------- | ----------------------------------------------------------------------------- |
| .NET / ASP.NET Core (Minimal APIs)           | 10 (LTS) | API REST enxuta; validação, limite de requisições, CORS, ProblemDetails e cache já vêm no framework |
| Entity Framework Core + Npgsql               | 10       | Consultas parametrizadas e projetadas direto para o contrato; migrations versionadas |
| PostgreSQL                                   | 17       | Banco de código aberto; schema próprio e usuário somente leitura para a API   |
| xUnit v3 + Microsoft Testing Platform        | 4        | Testes unitários e de integração (API real contra um PostgreSQL de verdade)   |
| Analisadores .NET + `dotnet format`          | —        | Regras `latest-recommended` com avisos tratados como erro; estilo verificado no build |
| NuGet com versões centralizadas e lock files | —        | Dependências travadas, de fonte única (nuget.org) e auditadas contra vulnerabilidades |

## 3. Arquitetura da solução

```
┌────────────────────────────┐  HTTP/JSON (/api)  ┌──────────────────────────┐  SQL   ┌────────────────────────┐
│ Front-end (React SPA)      │ ─────────────────► │ API REST (.NET 10)       │ ─────► │ PostgreSQL 17          │
│ - Catálogo, detalhes, AVA  │ ◄───────────────── │ - só GET, sem escrita    │ ◄───── │ schema "catalog"       │
└────────────────────────────┘                    └──────────────────────────┘        └────────────────────────┘
             │ modo "mock" (sem back-end)                                                  ▲ migrations + seed
             ▼                                                                             │ (DbMigrator, usuário
   data/courses.seed.json  ◄── fonte única dos dados fictícios (mock do front e seed) ─────┘  dono do banco)
```

O front chama `/api` na mesma origem: localmente, o Vite repassa as chamadas para a API (porta 5080); na
publicação, a hospedagem faz o mesmo. Assim não é preciso liberar CORS em produção.

### Camadas do front-end (Clean Architecture)

As dependências apontam sempre para dentro: a interface conhece os casos de uso, que conhecem o domínio;
o domínio não conhece React, HTTP nem bibliotecas.

```
src/
├── domain/          Regras e contratos puros (entidades, filtros, regra de matrícula, erros, porta CourseRepository)
├── application/     Casos de uso (listCourses, getCourseDetails, getCourseFilterOptions)
├── infrastructure/  Adaptadores: cliente HTTP, repositório da API, repositório em memória (mock), DTOs/mapeadores
├── presentation/    React: componentes reutilizáveis, layouts, páginas (features), hooks e consultas (TanStack Query)
├── app/             Raiz de composição: injeção de dependências, rotas, providers e estilos globais
└── shared/          Utilitários genéricos (datas, texto, classes CSS)
```

- **Injeção de dependências:** `app/createDependencies.ts` decide, pela variável `VITE_API_MODE`, se a
  aplicação usa a API (`httpCourseRepository`) ou os dados em memória (`inMemoryCourseRepository`).
  As páginas não sabem de onde vêm os dados — o que permitiu construir todo o front antes do back-end e,
  no futuro, trocar a fonte por uma integração com o Moodle sem alterar a interface.
- **Contrato isolado:** a API devolve DTOs (`courseDtos.ts`), convertidos em entidades do domínio pelos
  mapeadores. Mudanças no formato da API ficam restritas à infraestrutura.
- **Estado na URL:** busca e filtros ficam nos parâmetros da URL (`/cursos?busca=metal&categoria=matematica`),
  o que permite compartilhar/favoritar uma consulta e usar voltar/avançar do navegador.
- **Componentes reutilizáveis:** um único `CourseCard` atende o carrossel da home e o grid do catálogo;
  `Carousel`, `TestimonialsSection`, `FeatureList`, `StateMessage` (vazio/erro/não encontrado),
  `Button`/`ButtonLink` etc. são compartilhados entre as páginas.
- **Carregamento sob demanda e prefetch:** cada página (exceto a inicial) é um arquivo JavaScript separado
  (`presentation/routes/routeModules.ts`). Ao apontar ou focar um link, o código da página e — no caso dos
  cards — os dados do curso já começam a ser baixados, então a navegação parece instantânea.

### Camadas do back-end (Clean Architecture)

A mesma divisão do front, em projetos separados: as referências entre projetos fazem o compilador
impedir uma dependência no sentido errado (o domínio não conhece banco, HTTP nem bibliotecas).

```
backend/src/
├── CourseCatalog.Domain/          Entidades (curso, categoria, modalidade, status, módulo, aula) e regras de texto da busca e de slug
├── CourseCatalog.Application/     Casos de uso (CourseCatalogService), filtros, DTOs do contrato e a porta ICourseRepository
├── CourseCatalog.Infrastructure/  EF Core + PostgreSQL: DbContext, mapeamento, migrations, repositório, seed e permissões
├── CourseCatalog.Api/             Endpoints, segurança (cabeçalhos, CORS, limites, proxy) e raiz de composição (injeção de dependências)
└── CourseCatalog.DbMigrator/      Aplica migrations e seed com o usuário dono do banco; a API nunca altera o banco
```

- **Mesmos casos de uso e mesmo contrato do front:** listar, ver detalhes e opções de filtro. Os testes
  de contrato comparam cada resposta da API com o seed montado do mesmo jeito que o mock do front.
  Assim, trocar `VITE_API_MODE=mock` por `http` não muda nada na tela.
- **Consultas enxutas:** cada endpoint projeta direto para o DTO e lê só as colunas necessárias, sem
  rastreamento de entidades.
- **Busca igual à do front:** sem diferenciar acentos nem maiúsculas, no nome completo e no nome breve.
  O seed grava os nomes já normalizados, e o termo buscado passa pela mesma normalização.

### Segurança do back-end

A API é pública e somente leitura. Por isso **não tem login**: não há dado privado nem operação de
escrita a proteger, e autenticação só aumentaria a superfície de ataque. As demais camadas de defesa:

| Risco | Medida |
| ----- | ------ |
| Superfície exposta | Só `GET`, inclusive no `/health` (outros métodos → 405). OpenAPI só em desenvolvimento. Sem o cabeçalho `Server`. `AllowedHosts` restrito |
| Injeção de SQL | Consultas só via LINQ/EF (parametrizadas). Nenhum SQL concatenado: até o GRANT recebe o nome do usuário como parâmetro, e o próprio PostgreSQL o cita (`format('%I')`) |
| Entrada inválida | Validação nativa do .NET 10: busca com até 100 caracteres (o mesmo limite do front) e códigos com até 50; acima disso, 400 com os erros por campo. `featured` não booleano também dá 400. Slug fora do formato vira 404 sem consultar o banco. Caractere nulo, que o PostgreSQL não aceita em texto, resulta em lista vazia (como no mock) |
| Vazamento de informação | As respostas são DTOs do contrato, nunca entidades. Erros em ProblemDetails (RFC 9457) com `traceId`, sem stack trace, SQL ou nome do banco |
| Abuso e sobrecarga | 300 requisições por minuto por IP e 64 simultâneas na instância (com fila de 128); acima disso, 429 com `Retry-After`. Tempo máximo de 10 s por requisição e de 5 s por consulta (definido no usuário do banco). Cache de 60 s para consultas repetidas |
| Navegador | `X-Content-Type-Options: nosniff`, `Content-Security-Policy: default-src 'none'; frame-ancestors 'none'`, `X-Frame-Options`, `Referrer-Policy: no-referrer` e `Cross-Origin-Resource-Policy`. Erros com `no-store`. HSTS fora do desenvolvimento. CORS só para origens exatas, só `GET` e sem credenciais; em produção, mesma origem e sem CORS |
| Proxy da hospedagem | `X-Forwarded-For`/`-Proto` só são lidos quando `ReverseProxy:Enabled` está ligado, com o número de proxies confiáveis configurado: um IP forjado pelo cliente é ignorado |
| Credenciais | Connection strings só em variável de ambiente ou no `dotnet user-secrets` (fora do repositório). A API não sobe sem configuração válida. Senhas aleatórias de 48 caracteres |
| Banco | O dono (migrations e seed) é separado do usuário da API, que só tem `CONNECT` e `SELECT`. As sessões desse usuário já começam somente leitura e com limite de 20 conexões. Ninguém mais conecta ao banco. Regras `CHECK`, `FOREIGN KEY` e `UNIQUE` valem no próprio banco (ex.: a imagem só pode ser `/images/courses/<slug>.webp`) |
| Dependências | Poucas e oficiais (Microsoft e Npgsql). Versões centralizadas e travadas (`packages.lock.json`). Auditoria de vulnerabilidades com aviso tratado como erro. Única fonte: nuget.org (`packageSourceMapping`) |
| Agentes de IA | Regras do `.claude/settings.json` impedem o Claude Code de abrir o arquivo de segredos locais e de rodar `dotnet user-secrets list`. São regras por padrão de comando: uma camada a mais, não uma garantia |

Os testes de integração (`SecurityTests` e `DatabaseTests`) verificam:
- cabeçalhos, CORS, métodos e hosts recusados;
- limite de requisições, validação, injeção de SQL e erros sem detalhes internos;
- configuração obrigatória e permissões e limites do usuário da API;
- regras do banco: escrever com o usuário da API e gravar uma imagem externa são recusados pelo PostgreSQL.

Ficam de fora, por dependerem da hospedagem: HSTS (só em HTTPS fora do `localhost`) e a leitura do
`X-Forwarded-For`.

## 4. Estrutura das pastas

```
sesi-catalogo-cursos/
├── README.md
├── USO_DE_IA.md
├── AGENTS.md                      # Instruções para agentes de IA (há outros em data/, backend/ e frontend/)
├── .claude/                       # Claude Code: permissões, hooks, skills, subagente e regras
├── docs/
│   └── desenvolvimento-com-ia.md  # Como o projeto é preparado para agentes de IA (com fontes oficiais)
├── data/
│   ├── courses.seed.json          # Dados fictícios: categorias, modalidades, status e cursos (com módulos e aulas)
│   └── search-cases.json          # Casos de busca que o mock do front e a API respondem igual (testados nos dois lados)
├── scripts/
│   ├── gerar-zip-publicacao.sh    # Gera o ZIP dos arquivos de publicação (seção 11)
│   └── LEIA-ME-publicacao.md      # Descrição incluída no ZIP
├── firebase.json                  # Firebase Hosting: site, /api → Cloud Run, cabeçalhos de segurança, CSP e cache
├── .firebaserc                    # Projeto do Firebase (sesi-catalogo-cursos)
├── backend/
│   ├── Dockerfile                 # Imagem da API para o Cloud Run (chiseled, com ICU, usuário sem privilégios)
│   ├── .gcloudignore              # O que não vai para o Cloud Build
│   ├── CourseCatalog.slnx         # Solução .NET 10
│   ├── global.json                # Versão do SDK e executor de testes (Microsoft Testing Platform)
│   ├── Directory.Build.props      # Regras comuns: nullable, analisadores, avisos como erro, auditoria do NuGet
│   ├── Directory.Packages.props   # Versão única de cada pacote NuGet
│   ├── NuGet.config               # Fonte única de pacotes (nuget.org)
│   ├── dotnet-tools.json          # Ferramenta local dotnet-ef (migrations)
│   ├── database/
│   │   └── setup.sql              # Cria os usuários (dono e somente leitura) e o banco
│   ├── src/                       # Domain, Application, Infrastructure (com Persistence/Migrations), Api e DbMigrator
│   └── tests/
│       ├── CourseCatalog.UnitTests/        # Regras de busca, filtros, casos de uso e validação do seed
│       └── CourseCatalog.IntegrationTests/ # API real + PostgreSQL: contrato, comportamento, segurança e permissões
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.ts             # Aliases, React Compiler, proxy de /api para a API local e configuração dos testes
    ├── .env.example               # Variáveis de ambiente documentadas
    ├── .env.firebase              # Modo do build da publicação (front chamando /api na própria origem)
    ├── public/
    │   ├── favicon.svg
    │   ├── robots.txt
    │   ├── fonts/                 # Open Sans (WOFF2, subconjuntos latinos) + licença OFL
    │   └── images/
    │       ├── hero/              # Foto do hero em 3 larguras (pré-carregada pelo index.html)
    │       └── courses/           # Imagens dos cursos em 600 e 1200 px (WebP)
    ├── scripts/
    │   ├── verify-csp.mjs         # Confere os hashes da CSP do firebase.json contra o index.html do build
    │   └── optimize-images.mjs    # Converte os PNGs fornecidos em WebP otimizados
    └── src/
        ├── main.tsx
        ├── app/                   # Composição: rotas, providers, DI, QueryClient, estilos globais (fonts, tokens, base, acessibilidade)
        ├── domain/                # Entidades, filtros, regras de negócio e erros
        ├── application/           # Casos de uso
        ├── infrastructure/        # HTTP, repositórios (API e mock), DTOs e mapeadores
        ├── presentation/
        │   ├── accessibility/     # Preferências do menu "Acessibilidade" (salvas no navegador) e carregador do VLibras
        │   ├── components/        # Design system: Button, Tag, CourseCard, Carousel, Accordion, AccessibilityMenu, SkipLinks, ...
        │   ├── layouts/           # RootLayout (rolagem), SiteLayout, Header, Footer
        │   ├── features/          # Páginas: home, catalog, course-details, learning (AVA), accessibility, institutional, errors
        │   ├── hooks/             # Hooks de UI (rolagem, visibilidade, debounce)
        │   ├── queries/           # Hooks do TanStack Query
        │   ├── content/           # Textos institucionais do Figma (depoimentos, FAQ, estatísticas)
        │   ├── routes/            # Caminhos, âncoras dos atalhos e módulos das páginas (lazy + prefetch)
        │   └── utils/             # Utilitários de interface (ex.: srcset das imagens dos cursos)
        ├── shared/utils/          # Datas, texto e classes CSS
        └── test/                  # Setup e utilitários de teste
```

Os testes ficam ao lado do código testado (`*.test.ts(x)`).

## 5. Instruções para execução

### Pré-requisitos

- Node.js **22.12 ou superior** (testado com Node 26) e npm.
- Para o back-end: [.NET SDK 10](https://dotnet.microsoft.com/download/dotnet/10.0) e PostgreSQL 15 ou
  mais novo com o cliente `psql` (testado com PostgreSQL 17).

### Front-end com dados fictícios (sem back-end)

```bash
cd frontend
npm install
npm run dev
```

Acesse <http://localhost:5173>. Por padrão (`.env.development`) o front usa os dados de
`data/courses.seed.json` em memória, com 600 ms de latência simulada para evidenciar o carregamento.

Para testar **em um celular de verdade**, conectado à mesma rede Wi-Fi do computador, use
`npm run dev:host` e abra no celular o endereço "Network" exibido no terminal (ex.: `http://192.168.0.10:5173`).

- **Estado de erro:** acrescente `?simularErro` em qualquer URL (ex.: `/cursos?simularErro`) no modo mock.
- **Estado vazio:** busque por um termo inexistente (ex.: `/cursos?busca=xyz`).

Para rodar a **versão de produção** localmente (útil se a hospedagem estiver indisponível):

```bash
cd frontend
npm run build
npm run preview
```

Acesse <http://localhost:4173>. Sem `VITE_API_BASE_URL` configurada, o build também usa os dados
fictícios em memória (que ficam em um arquivo separado, carregado só nesse modo), sem a latência simulada
(`.env.production`).

### Back-end (API .NET + PostgreSQL)

Com o PostgreSQL rodando, na raiz do repositório (macOS/Linux; o equivalente para Windows vem logo depois):

```bash
# 1. Usuários e banco (uma vez). As senhas são geradas na hora e não vão para nenhum arquivo do projeto.
export CATALOG_OWNER_PASSWORD="$(openssl rand -hex 24)" CATALOG_API_PASSWORD="$(openssl rand -hex 24)"
psql -X -d postgres -f backend/database/setup.sql

# 2. Connection strings no dotnet user-secrets (guardado no seu usuário, fora do repositório)
cd backend
dotnet user-secrets set --project src/CourseCatalog.DbMigrator "ConnectionStrings:CatalogAdmin" \
  "Host=localhost;Database=course_catalog;Username=catalog_owner;Password=$CATALOG_OWNER_PASSWORD"
dotnet user-secrets set --project src/CourseCatalog.Api "ConnectionStrings:Catalog" \
  "Host=localhost;Database=course_catalog;Username=catalog_api;Password=$CATALOG_API_PASSWORD;Maximum Pool Size=15"
unset CATALOG_OWNER_PASSWORD CATALOG_API_PASSWORD

# 3. Migrations + dados fictícios + permissão de leitura (pode repetir: deixa o banco igual ao seed)
dotnet run --project src/CourseCatalog.DbMigrator

# 4. API em http://localhost:5080 (ex.: http://localhost:5080/api/courses)
dotnet run --project src/CourseCatalog.Api
```

No Windows (PowerShell 7), os passos 1 e 2 ficam assim; o `-U postgres` usa o administrador criado pelo
instalador do PostgreSQL:

```powershell
$env:CATALOG_OWNER_PASSWORD = [Convert]::ToHexString([Security.Cryptography.RandomNumberGenerator]::GetBytes(24))
$env:CATALOG_API_PASSWORD = [Convert]::ToHexString([Security.Cryptography.RandomNumberGenerator]::GetBytes(24))
psql -X -U postgres -d postgres -f backend/database/setup.sql
cd backend
dotnet user-secrets set --project src/CourseCatalog.DbMigrator "ConnectionStrings:CatalogAdmin" "Host=localhost;Database=course_catalog;Username=catalog_owner;Password=$env:CATALOG_OWNER_PASSWORD"
dotnet user-secrets set --project src/CourseCatalog.Api "ConnectionStrings:Catalog" "Host=localhost;Database=course_catalog;Username=catalog_api;Password=$env:CATALOG_API_PASSWORD;Maximum Pool Size=15"
```

Em desenvolvimento, o documento OpenAPI fica em <http://localhost:5080/openapi/v1.json>.

| Comando (`backend/`)                                  | Descrição                                                                   |
| ----------------------------------------------------- | --------------------------------------------------------------------------- |
| `dotnet build`                                        | Compila com os analisadores; qualquer aviso quebra o build                  |
| `dotnet format --verify-no-changes`                   | Verifica a formatação (sem a opção, corrige)                                |
| `dotnet test`                                         | Testes unitários e de integração (contra um banco temporário)               |
| `dotnet run --project src/CourseCatalog.DbMigrator`   | Aplica as migrations e o seed                                               |
| `dotnet list package --vulnerable --include-transitive` | Lista pacotes com vulnerabilidades conhecidas                             |

Os testes de integração criam um banco temporário com o `setup.sql` e o apagam no fim. Por padrão, eles
usam o PostgreSQL local com o usuário do sistema. Para outro servidor, defina
`CATALOG_TEST_ADMIN_CONNECTION` (ex.: `Host=localhost;Username=postgres;Password=...`).

### Front-end consumindo a API

Com a API rodando, crie `frontend/.env.local` com a linha abaixo. Esse arquivo é pessoal e fica fora do
git; a configuração do Claude Code impede o agente de lê-lo ou editá-lo, então crie-o à mão:

```env
VITE_API_MODE=http
```

Depois rode `npm run dev` em `frontend/`. Sem `VITE_API_BASE_URL`, o front chama `/api` na própria
origem, e o Vite repassa as chamadas para <http://localhost:5080>. Isso vale também no `npm run preview`
e no teste pelo celular (`npm run dev:host`).

### Scripts disponíveis (`frontend/`)

| Comando                    | Descrição                                                    |
| -------------------------- | ------------------------------------------------------------ |
| `npm run dev`              | Servidor de desenvolvimento                                  |
| `npm run dev:host`         | Servidor de desenvolvimento acessível na rede local (testes no celular) |
| `npm run build`            | Verificação de tipos + build de produção em `dist/`          |
| `npm run build:firebase`   | Build da publicação (front chamando `/api` na própria origem) + verificação dos hashes da CSP |
| `npm run preview`          | Serve o build de produção localmente                         |
| `npm run check`            | Verificação completa: tipos + ESLint + formatação + testes    |
| `npm test`                 | Executa os testes (Vitest)                                   |
| `npm run lint`             | ESLint                                                       |
| `npm run typecheck`        | Verificação de tipos (TypeScript)                            |
| `npm run format`           | Formata o código com o Prettier (`format:check` só verifica) |
| `npm run images:optimize -- "<pasta dos PNGs>" ["<pasta das fotos do Figma>"]` | Regera as imagens WebP a partir dos PNGs fornecidos e, se informada, das fotos originais dos cursos baixadas do protótipo do Figma |

### Desenvolvimento com agentes de IA

O repositório traz instruções versionadas para agentes de código (`AGENTS.md` na raiz, em `data/`, em `backend/` e em
`frontend/`) e uma configuração compartilhada do Claude Code em `.claude/`. Ela inclui permissões
mínimas, um hook que formata cada arquivo editado e um portão que verifica a parte alterada
(`npm run check` no front; build, formatação e testes no back) antes de o agente encerrar uma tarefa. Inclui também skills de auditoria e um subagente revisor. Para usar, abra o
Claude Code na raiz `sesi-catalogo-cursos/`. Detalhes, decisões e fontes oficiais estão em
[`docs/desenvolvimento-com-ia.md`](docs/desenvolvimento-com-ia.md).

## 6. Configuração do banco

**PostgreSQL 17** (código aberto), com as tabelas no schema próprio `catalog`. A preparação tem duas
etapas, cada uma com a credencial mínima necessária. Os comandos estão na seção 5.

1. **`backend/database/setup.sql`** — rodado uma vez por um administrador do PostgreSQL. Cria o banco
   `course_catalog` e dois usuários sem nenhum privilégio administrativo. As senhas vêm de variáveis
   de ambiente, com no mínimo 16 caracteres. Pode rodar de novo, por exemplo para trocar as senhas.
   - Funciona com superusuário (instalação local) e com o administrador de serviços gerenciados
     (CREATEROLE + CREATEDB, sem superusuário). Os dois casos foram testados.
   - Como em todo `ALTER ROLE ... PASSWORD`, o servidor recebe a senha em texto. Ela pode ir para o log
     se o comando falhar ou se o servidor registrar todos os comandos. Num servidor que não é seu, troque
     as senhas depois com `\password catalog_owner` e `\password catalog_api` no `psql`, que envia só o
     verificador SCRAM-SHA-256.
2. **`CourseCatalog.DbMigrator`** — roda com o usuário dono. Aplica as migrations do EF Core, grava os
   dados de [`data/courses.seed.json`](data/courses.seed.json) e dá ao usuário da API permissão só de
   leitura. Antes de gravar, valida o seed: referências, duplicidades, formatos e campos desconhecidos.
   Grava tudo numa única transação, então pode rodar quantas vezes quiser; o banco fica sempre igual
   ao arquivo.

| Usuário         | Usado por               | Pode                                                                                     |
| --------------- | ----------------------- | ---------------------------------------------------------------------------------------- |
| `catalog_owner` | `CourseCatalog.DbMigrator` | Ser dono do banco e do schema: criar tabelas e gravar o seed                          |
| `catalog_api`   | API                     | Conectar e fazer `SELECT`. Sessões somente leitura, consultas de até 5 s, até 20 conexões |
| `PUBLIC`        | qualquer outro usuário  | Nada: não conecta ao banco                                                               |

Tabelas: `categories`, `modalities`, `statuses`, `courses`, `course_modules` e `course_lessons`. Módulos
e aulas têm chave composta (curso + posição) e saem em cascata com o curso. Regras garantidas pelo
próprio banco:
- slugs e códigos em kebab-case e únicos;
- cor em `#RRGGBB`;
- carga horária de 1 a 2000 h;
- imagem sempre `/images/courses/<slug>.webp`;
- categoria, modalidade e status em uso não podem ser apagados.

As colunas `full_name_search_key` e `short_name_search_key` guardam os nomes sem acento e em minúsculas,
que a busca compara com o termo normalizado do mesmo jeito.

Para mudar o modelo, crie uma migration (versionadas em
`backend/src/CourseCatalog.Infrastructure/Persistence/Migrations/`):

```bash
cd backend
dotnet tool restore
dotnet ef migrations add NomeDaMudanca --project src/CourseCatalog.Infrastructure \
  --startup-project src/CourseCatalog.DbMigrator --output-dir Persistence/Migrations
```

Para obter o esquema em SQL puro (ex.: para revisão), use `dotnet ef migrations script --idempotent`
com os mesmos `--project` e `--startup-project`.

> No PostgreSQL instalado pelo Homebrew, as conexões locais usam o método `trust` (o `pg_hba.conf`
> padrão). Nesse caso, a senha não é conferida na máquina local, mas as permissões continuam valendo.
> Para exigir senha também localmente, troque `trust` por `scram-sha-256` nas linhas `host` do
> `pg_hba.conf` e reinicie o PostgreSQL.

## 7. Endpoints

Contrato REST consumido pelo front-end (`src/infrastructure/course/httpCourseRepository.ts`) e
implementado pela API .NET (`backend/src/CourseCatalog.Api/Endpoints/CatalogEndpoints.cs`):

| Método | Rota                    | Descrição                                     | Parâmetros de consulta                                      |
| ------ | ----------------------- | --------------------------------------------- | ----------------------------------------------------------- |
| GET    | `/api/courses`          | Lista cursos (resumo) com filtros combináveis | `search`, `category` (slug), `modality` (código), `status` (código), `featured` |
| GET    | `/api/courses/{slug}`   | Detalhes do curso (com módulos e aulas)       | —                                                           |
| GET    | `/api/categories`       | Categorias (opções do filtro)                 | —                                                           |
| GET    | `/api/modalities`       | Modalidades (opções do filtro)                | —                                                           |
| GET    | `/api/statuses`         | Status (opções do filtro)                     | —                                                           |

Exemplo — `GET /api/courses?search=metalurgia&category=ciencias-da-natureza`:

```json
{
  "items": [
    {
      "id": 4,
      "slug": "fisica-do-movimento-e-da-energia",
      "fullName": "Física do Movimento e da Energia na Metalurgia",
      "shortName": "Física na Metalurgia",
      "summary": "Estudo de forças, atrito, calor e energia em máquinas, fornos e prensas.",
      "category": { "id": 2, "slug": "ciencias-da-natureza", "name": "Ciências da Natureza", "color": "#E4CCFF" },
      "modality": { "code": "presencial", "name": "Presencial" },
      "status": { "code": "inscricoes-abertas", "name": "Inscrições abertas" },
      "workloadHours": 80,
      "imageUrl": "/images/courses/fisica-do-movimento-e-da-energia.webp",
      "availableFrom": "2026-11-16",
      "featured": true
    }
  ],
  "total": 1
}
```

Regras da busca e dos filtros (as mesmas do mock do front):
- A busca procura o termo no nome completo **ou** no nome breve, sem diferenciar acentos nem maiúsculas
  e ignorando espaços repetidos.
- Os filtros comparam o slug ou o código exato. Valor que não existe devolve `{"items":[],"total":0}`.
- `featured=true` traz só os destaques; `featured=false` não filtra.
- A ordem é a do catálogo (`id`) e `total` é a quantidade de cursos depois dos filtros.

Respostas de erro, sempre em `application/problem+json` (RFC 9457) com título em português e
`traceId`, sem detalhes internos:

| Status | Quando                                                                                       | No front                         |
| ------ | -------------------------------------------------------------------------------------------- | -------------------------------- |
| `400`  | Parâmetro inválido: busca com mais de 100 caracteres ou código com mais de 50 (com os erros por campo), `featured` não booleano | Mensagem de erro com "Tentar novamente" |
| `404`  | Curso inexistente (ou slug fora do formato) e rota desconhecida                              | "Curso não encontrado"           |
| `405`  | Qualquer método além de `GET` (cabeçalho `Allow: GET`)                                      | —                                |
| `429`  | Limite de requisições excedido (cabeçalho `Retry-After`)                                     | Mensagem de erro com "Tentar novamente" |
| `500`  | Falha interna (ex.: banco indisponível)                                                      | Mensagem de erro com "Tentar novamente" |
| `504`  | A requisição passou de 10 s na API                                                           | Mensagem de erro com "Tentar novamente" |

Falhas de rede e tempo esgotado (15 s, no front) também exibem a mensagem de erro com "Tentar novamente".
Respostas de sucesso trazem `Cache-Control: public, max-age=60`; erros, `no-store`. `GET /health`
responde `Healthy` sem consultar o banco (verificação de saúde da hospedagem).

## 8. Modelo de dados

```
Category (categoria)          Modality (modalidade)     Status
─────────────────────         ────────────────────      ─────────────────────
id, slug, name, color         code, name                code, name
  │                             │                         │
  └──────────────┐   ┌──────────┘   ┌─────────────────────┘
                 ▼   ▼              ▼
Course (curso) ───────────────────────────────────────────────────────────────
id, slug
fullName        → Nome completo           (Moodle: fullname)
shortName       → Nome breve              (Moodle: shortname)
summary         → Descrição curta (cards) (Moodle: summary)
description     → Descrição completa ("Sobre o curso")
categoryId, modalityCode, statusCode
workloadHours   → Carga horária (h)
targetAudience  → Público-alvo
imageUrl        → Imagem de apresentação
availableFrom   → Data de disponibilização, quando aplicável (null = início imediato)
certification   → Certificadora (SESI)
featured        → Destaque em "Principais cursos"
  └── modules[]  → Module: title
        └── lessons[] → Lesson: title, description
```

No banco, cada entidade é uma tabela do schema `catalog` (modalidade e status são referenciados por chave;
no seed e na API, pelo código). Detalhes e restrições na seção 6.

Dados fictícios: **8 cursos, 4 categorias** (Matemática, Ciências da Natureza, Linguagens, Sustentabilidade),
**3 modalidades** (EAD, Presencial, Híbrido) e **3 status** (Inscrições abertas, Em breve, Encerrado), com
cargas horárias de 20 h a 80 h, de 4 a 10 módulos e públicos-alvo distintos. Um teste automatizado
(`inMemoryCourseRepository.test.ts`) garante esses mínimos exigidos pelo enunciado.

**Regras de negócio** (camada de domínio):

- Matrícula só é permitida para cursos com **inscrições abertas**; para "Em breve"/"Encerrado" o botão
  fica indisponível com o motivo ("Inscrições em breve"/"Inscrições encerradas").
- O conteúdo no AVA só é liberado a partir da data de disponibilização (cursos "Em breve" exibem a data).
- O rótulo da data acompanha o status: "Início do curso", "Disponível a partir de" ou "Última turma iniciada em".

## 9. Estratégia de responsividade

O protótipo só tem a versão desktop (1366 px). As demais larguras foram projetadas com o mesmo design system,
seguindo estes princípios:

- **Mobile-first:** os estilos base são para telas pequenas; `min-width` amplia o layout.
- **Layout fluido:** tipografia e espaçamentos com `clamp()` — o valor máximo é o medido no Figma (ex.: título
  do hero 72 px) e o mínimo é a adaptação para celulares; grids com `auto-fill`/`minmax()`.
- **Container queries nos componentes reutilizáveis** (lista de diferenciais, estatísticas e barra de
  filtros): o componente se adapta ao espaço que recebe, não à largura da tela. O mesmo `FeatureList` mostra
  3 colunas na coluna estreita da página inicial e 4 na página do curso.
- **Sem itens "órfãos":** a lista de diferenciais escolhe as colunas pela quantidade de itens
  (3 itens → 1 ou 3 colunas; 4 itens → 1, 2×2 ou 4), evitando linhas como 3+1 ou 2+1.

| Largura    | O que muda |
| ---------- | ---------- |
| < 640 px   | Menu recolhível; no catálogo, a busca fica visível e os filtros recolhidos em "Filtros (n)", para os resultados aparecerem logo; estatísticas empilhadas; rodapé com "Navegação" e "Suporte" lado a lado |
| ≥ 640 px   | Rodapé em grade 2×2; filtros sempre visíveis quando a área do catálogo tem ≥ 40 rem (≈ 680 px de tela, por container query) |
| ≥ 768 px   | Menu completo no cabeçalho; AVA com menu lateral fixo |
| ≥ 1024 px  | Layouts em duas colunas (impacto, CTA, destaque do curso, "Sobre o curso"); rodapé em 4 colunas; filtros em uma linha (área do catálogo ≥ 60 rem) |
| ≥ 1366 px  | Layout do Figma (área útil de 1150 px, cards de 275 px) |

Cuidados para dispositivos reais:

- **Altura da tela:** o título do hero também considera a altura (`min(…vw, …vh)`) e o cabeçalho fica mais
  baixo com o celular deitado; unidades `svh`/`dvh` respeitam a barra de endereço do navegador móvel.
- **Áreas seguras do iPhone:** `viewport-fit=cover` + `env(safe-area-inset-*)` nas margens laterais e na barra
  fixa de matrícula (não fica sob a barra de gestos).
- **Formulários com 16 px:** evita o zoom automático do iOS ao focar um campo.
- **Toque:** áreas clicáveis de 40–48 px (32 px nos ícones sociais e 28 px na busca do AVA, que seguem o Figma; acima dos 24 px da WCAG 2.2); efeitos de hover só em dispositivos com mouse (`@media (hover: hover)`).
- **Carrosséis com rolagem nativa** (`scroll-snap`): deslizar no toque, trackpad ou teclado; a faixa de cards
  "vaza" até a borda da tela, como no Figma, e as setas somem quando não há o que rolar.

**Como foi testado:** 320, 360, 390, 768, 1024, 1366 e 1920 px, além de 844 × 390 (celular deitado), nas
quatro páginas, com filtros, acordeões e sumário do AVA abertos — sem rolagem horizontal em nenhum caso.
Para testar em um celular, use `npm run dev:host` (seção 5).

### Desempenho (performance)

- **Fonte:** Open Sans auto-hospedada, só o subconjunto latino (48 KB), com `preload`. Enquanto carrega, uma
  Arial com métricas ajustadas (`size-adjust`, `ascent-override`, `descent-override` — calculados a partir
  dos arquivos das duas fontes) ocupa o mesmo espaço, então o texto não "pula" ao trocar de fonte.
- **LCP:** a página inicial é carregada junto com a aplicação (não é lazy) e a foto do hero é pré-carregada
  pelo `index.html` com `fetchpriority="high"`. No catálogo, a foto do primeiro card (o maior elemento da tela
  no celular) é baixada sem lazy loading e com `fetchpriority="high"`; as demais usam lazy loading e, em telas
  estreitas, os cards do 5º em diante só são renderizados quando o usuário se aproxima
  (`content-visibility: auto`), para que as fotos deles não disputem banda com a primeira. No modo mock, o
  arquivo com os dados fictícios começa a baixar junto com a aplicação, em paralelo com o código da página;
  sem isso, a foto só seria pedida depois dos dois downloads em sequência.
- **JavaScript:** code splitting por página, prefetch por intenção (hover/foco) e bibliotecas (React, React
  Router, TanStack Query) em arquivos próprios, que continuam em cache entre deploys. Os dados fictícios ficam
  em um arquivo separado, baixado só no modo mock.
- **Imagens:** WebP em 2–3 larguras com `srcset`/`sizes`. Os PNGs fornecidos e as fotos originais do
  protótipo (≈ 48 MB) viraram ≈ 1 MB no total.
- **Dados:** cache de 5 min (TanStack Query), deduplicação e cancelamento de requisições obsoletas, e busca com
  debounce de 350 ms (uma requisição quando o usuário para de digitar, não uma por tecla).
- **Estabilidade visual:** skeletons com as dimensões finais e imagens com `width`/`height` → CLS 0.
- **Barra fixa de matrícula:** a posição do botão do topo e do "Fale com a gente" é medida na rolagem e nas
  mudanças de tamanho (no máximo uma vez por quadro, dois elementos). Um `IntersectionObserver` não serve: ele
  não percebe saltos de rolagem (rolagem restaurada ao recarregar, teclas Home/End) e deixava a barra
  escondida.

Resultados do **Lighthouse 13** no build de produção (`npm run build && npm run preview`, dados em modo mock):

| Página            | Mobile — Desempenho / Acessibilidade / Boas práticas / SEO | Desktop |
| ----------------- | ---------------------------------------------------------- | ------- |
| Início            | 95 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |
| Catálogo          | 90 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |
| Detalhes do curso | 93 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |

O perfil "mobile" do Lighthouse simula um celular intermediário em 4G lento com CPU 4× mais lenta. Em todas as
páginas: CLS 0 e Total Blocking Time 0 ms.

No catálogo, o 93 medido antes não se repetia: execuções idênticas davam 87 ou 92. A foto do primeiro card
começava a baixar com prioridade baixa e, quando o Chrome a promovia tarde, o Lighthouse deixava o download dela
fora do cálculo do LCP. Com `fetchpriority="high"` a foto sempre entra na conta: 90 em 5 execuções seguidas
(LCP 3,3–3,4 s). É o limite do orçamento, porque a foto só começa a baixar depois que o JavaScript da aplicação
(≈ 150 KB comprimidos) chega e monta a lista. Depois da troca pelas fotos originais do Figma, três execuções
deram 90, 89 e 90 (LCP 3,30–3,38 s).

Com os recursos de acessibilidade (seção 10), o painel de preferências, a página de acessibilidade e o VLibras
são baixados só quando usados; no carregamento entram apenas o botão do cabeçalho e um script inline de ~600
bytes. Duas execuções por página no celular: início 92 e 95, catálogo 90 e 89 (LCP 3,3–3,4 s), detalhes 93 e
93 — acessibilidade, boas práticas e SEO seguem em 100, com CLS 0 e TBT 0 ms.

## 10. Decisões de acessibilidade

Mesmo fora do Figma e do enunciado, a acessibilidade foi tratada como parte da qualidade esperada de uma
instituição de educação: além da base da WCAG 2.2 nível AA, o site oferece recursos para perfis diferentes de
usuários, seguindo também o eMAG (modelo de acessibilidade do Governo Federal).

| Perfil | Recursos |
| ------ | -------- |
| Baixa visão | Texto a 125% ou 150% pelo menu e zoom do navegador até 400% sem rolagem horizontal; alto contraste (preto, branco e amarelo); suporte ao alto contraste do Windows (`forced-colors`) e ao "aumentar contraste" do sistema (`prefers-contrast`); textos com contraste ≥ 4,5:1 e campos com contorno ≥ 3:1. |
| Cegueira (leitores de tela) | Regiões e títulos em ordem, textos alternativos, nomes acessíveis, anúncios de resultados e erros, foco levado ao conteúdo a cada troca de página e `<title>` por rota. |
| Surdez | Tradução dos textos para Libras com o VLibras (Governo Federal). |
| Mobilidade reduzida | Atalhos de teclado do eMAG, tudo operável pelo teclado, foco visível e nunca escondido pelas barras fixas, áreas de toque ≥ 24 px e carrosséis com setas (nenhum gesto obrigatório). |
| Dislexia, TDAH e outras condições cognitivas | Espaçamento ampliado, links destacados, animações desligáveis, linguagem direta e navegação igual em todas as páginas. |
| Sensibilidade a movimento | Nada pisca; animações e rolagem suave desligáveis pelo sistema ou pelo menu. |

### Menu "Acessibilidade"

- **Onde:** botão com o símbolo de acessibilidade no cabeçalho (sempre visível, inclusive no celular) e na faixa
  do menu do AVA. Abre um `<dialog>` nativo: o foco fica na janela, `Esc` fecha e o foco volta ao botão.
- **Opções:** tamanho do texto (100%, 125% ou 150%), contraste (padrão ou alto), espaçamento ampliado (letras,
  palavras e linhas com os valores do critério 1.4.12 da WCAG), destacar links, reduzir animações, Libras e
  "Restaurar padrões".
- **Como funciona:** cada escolha vira um atributo no `<html>` (`data-text-size`, `data-contrast`,
  `data-text-spacing`, `data-links`, `data-motion`), lido pelo CSS global `src/app/styles/accessibility.css`;
  os ajustes de cada componente ficam no próprio módulo CSS. O alto contraste usa uma folha própria (fundo preto,
  texto branco, links e foco amarelos) em vez de trocar tokens, porque alguns tokens servem de texto e de fundo.
- **Persistência:** as escolhas ficam no `localStorage` e um script inline do `index.html` as aplica antes da
  primeira pintura (nada "pisca"). Um teste garante que esse script e o código TypeScript dão o mesmo resultado.
- **Desempenho:** o painel é baixado só quando aberto (3,7 KB comprimidos).
- **Texto ampliado:** o cabeçalho e a barra de matrícula usam container query; como `rem` em container query
  acompanha o tamanho do texto, eles se reorganizam antes (o menu vira o recolhível), sem quebrar o leiaute.

### Libras (VLibras)

O VLibras é o tradutor gratuito do Governo Federal. O script oficial só é baixado quando o usuário ativa a
opção (assim não pesa no carregamento nem faz requisições a terceiros sem necessidade); a escolha fica salva e,
nas visitas seguintes, o tradutor carrega quando o navegador fica ocioso. Desativar fecha o avatar e esconde o
botão sem recarregar a página. Com o VLibras ativo, os textos da página são enviados ao serviço para tradução,
o que está informado na página de acessibilidade.

### Atalhos de teclado (eMAG)

Links "Ir para o conteúdo [1]", "Ir para o menu [2]", "Ir para a busca [3]" (só no catálogo) e "Ir para o
rodapé [4]", invisíveis até receberem foco e com `accesskey` (Alt + número no Chrome e no Edge, Alt + Shift no
Firefox, Control + Option no Mac). No AVA, conteúdo e menu (sumário do curso). "Ir para o menu" leva ao
primeiro link ou, com o menu recolhido no celular, ao botão que o abre.

### Página de acessibilidade

`/acessibilidade` (link "Acessibilidade" no rodapé e no menu): recursos, atalhos, o que foi feito para cada
perfil, como verificamos, limitações conhecidas e o contato para relatar barreiras.

### Base da WCAG 2.2 AA

- **Semântica:** landmarks (`header`, `nav`, `main`, `footer`, `aside`), um `h1` por página e hierarquia de
  títulos; listas reais para cards, módulos e aulas; `dl` para os dados do curso.
- **Teclado:** foco visível em todos os elementos; menu móvel fecha com `Esc`; o card inteiro é clicável, mas tem
  um único ponto de foco (o link do título). Com a barra fixa de matrícula visível, `scroll-padding-bottom` faz
  o navegador rolar o elemento focado para cima dela (foco nunca escondido, critério 2.4.11).
- **Leitores de tela:** a quantidade de resultados fica em uma região `role="status"` (anunciada a cada
  filtro); erros usam `role="alert"`; o carregamento é anunciado ("Carregando cursos…"); após navegar, o
  foco vai para o conteúdo principal; a página de cada rota tem `<title>` próprio.
- **Componentes no padrão WAI-ARIA:** acordeão com `aria-expanded`/`aria-controls`, carrossel com
  `aria-roledescription` e botões rotulados, barra de progresso com `role="progressbar"`, botões só com
  ícone sempre com `aria-label`; no menu de acessibilidade, `fieldset`/`legend`, rádios e interruptores
  (`role="switch"`) nativos.
- **Formulários:** todos os campos têm `label`; selects nativos (melhor suporte em leitores e no celular);
  contorno dos campos com 3,4:1 de contraste (critério 1.4.11). No celular, o botão que recolhe os filtros
  anuncia quantos estão ativos ("Filtros (2 ativos)") e usa `aria-expanded`/`aria-controls`.
- **Zoom e telas baixas (1.4.10):** sem rolagem horizontal de 320 px a 1920 px. Com menos de 480 px de altura
  (celular deitado ou zoom de 300% a 400%), o cabeçalho deixa de acompanhar a rolagem e a barra de matrícula
  some, para não ocupar a tela.
- **Texto ampliado e espaçamento (1.4.4 e 1.4.12):** palavras longas quebram (`overflow-wrap`), botões e
  etiquetas quebram linha quando não cabem e as grades usam `minmax(0, 1fr)`.
- **Modos de contraste do sistema:** com `forced-colors` (Windows), bordas substituem as sombras e a barra de
  progresso e a opção marcada usam as cores do sistema; com `prefers-contrast: more`, textos de apoio e
  contornos ficam mais escuros.
- **Botões indisponíveis** usam `aria-disabled` (continuam perceptíveis) e informam o motivo no texto.
- **Contraste (WCAG AA):** o cinza dos textos de apoio é `#666` (5,7:1); o cargo nos depoimentos usa 88%
  de opacidade em vez dos 70% do Figma, que resultava em 3,4:1; status não dependem só de cor (sempre há texto).
- **Movimento reduzido:** animações e rolagem suave são desativadas com `prefers-reduced-motion` ou pelo menu.
- **Idioma** `pt-BR` declarado e imagens decorativas com `alt=""`.

### Como foi verificado

- **Lighthouse (axe-core):** acessibilidade 100 nas cinco páginas (início, catálogo, detalhes, AVA e
  `/acessibilidade`), também depois do menu novo.
- **Testes de unidade** do menu (aplica, salva, restaura e devolve o foco), das preferências (inclusive o
  script inline), dos atalhos (foco movido sem navegar pela âncora) e do VLibras (pronto, cancelado no meio,
  erro de carregamento e tempo esgotado).
- **Duas revisões de código independentes**, sem participação na implementação, mais uma revisão própria.
  Os achados, todos corrigidos e reverificados no navegador, incluíam:
  - atalhos desfeitos pela restauração de rolagem do React Router;
  - foco de campos invisível em `forced-colors`;
  - AVA abrindo rolado ao vir da barra fixa;
  - foco perdido ao trocar entre o site e o AVA;
  - botão "Fechar" do painel fora da tela com texto a 150%.
- **Teclado:** 270 navegações por `Tab` (inclusive com texto a 150% no celular), sem nenhum elemento focado
  escondido pelas barras fixas. Enter, Espaço, setas e `Esc` funcionam no painel, e o foco volta ao botão.
- **Texto e espaçamento sem rolagem horizontal:**
  - 104 combinações nas cinco páginas principais (texto a 125% e 150%, espaçamento da WCAG, larguras de 320 a
    1366 px);
  - 72 combinações nas páginas dos oito cursos (os rótulos mudam conforme o status);
  - todas as preferências ligadas ao mesmo tempo.
- **Contraste:** alto contraste do site e `forced-colors` (emulado no Chrome) conferidos página a página.
- **VLibras:** ativar, abrir o avatar, desativar, reativar, sincronizar entre abas e recarregar com a opção
  salva, testados no navegador.
- **Leiaute padrão:** comparação pixel a pixel antes e depois. Só mudaram o ícone do cabeçalho e do AVA, o link
  do rodapé e o contorno da busca do AVA.

## 11. Processo de publicação

Publicada em planos gratuitos, sem custo para o SESI-SP:

| Parte | Onde | Endereço |
| ----- | ---- | -------- |
| Site (front-end) | Firebase Hosting (CDN do Google) | <https://sesi-catalogo-cursos.web.app> |
| API .NET 10 | Google Cloud Run, região São Paulo (`southamerica-east1`) | <https://sesi-catalogo-cursos.web.app/api/courses> (mesmo domínio do site) |
| Banco PostgreSQL 18 | Neon (plano Free), AWS São Paulo | acessível só pela API |

```
Navegador ──► Firebase Hosting (sesi-catalogo-cursos.web.app)
                ├── arquivos do front (CDN, cabeçalhos de segurança e CSP)
                └── /api/** ──► Cloud Run: course-catalog-api (contêiner .NET 10)
                                    └──► Neon PostgreSQL (São Paulo, TLS, usuário somente leitura)
```

### Como está configurado

- **Mesmo domínio.** O Firebase repassa `/api/**` para o Cloud Run (`firebase.json`). O front, gerado
  com `npm run build:firebase` (modo `.env.firebase`), chama `/api` na própria origem, então não há CORS.
  Respostas de sucesso da API ficam 60 s no CDN do Firebase.
- **API (Cloud Run).**
  - A imagem vem do `backend/Dockerfile`: SDK fixo, restauração travada pelos lock files e imagem
    "chiseled" com ICU, rodando com usuário sem privilégios.
  - Tem 512 MiB e no máximo 2 instâncias. Sem uso, desliga.
  - Roda com uma identidade própria (`course-catalog-api@…`), que só consegue ler o segredo da connection
    string.
- **Segredos.** As connection strings ficam no Secret Manager: `catalog-api-connection` para a API e
  `catalog-owner-connection` para o migrador. Nenhuma senha fica em arquivo ou em variável comum.
- **Variáveis da API.**
  - `AllowedHosts`: os dois endereços `run.app` do serviço e os domínios do Firebase. O Firebase chama a
    API pelo endereço `…-rj.a.run.app`.
  - `ReverseProxy__Enabled=true` e `ReverseProxy__ForwardLimit=1`. Veja a seção 13.
- **Banco (Neon).**
  - Criado com o `backend/database/setup.sql`, rodado com o administrador do Neon (sem superusuário).
  - Preparado pelo `CourseCatalog.DbMigrator`, com a credencial do dono lida do Secret Manager.
  - A API conecta com `SSL Mode=VerifyFull` e `Channel Binding=Require`, até 8 conexões por instância.
- **Site.**
  - Cabeçalhos de segurança e CSP no `firebase.json`. Os dois scripts inline do `index.html` são liberados
    por hash, e o `build:firebase` falha se o hash não bater (`frontend/scripts/verify-csp.mjs`).
  - Cache: longo para `/assets` (nomes com hash), 7 dias para imagens e `no-cache` para as páginas.
- **Custo.** Fica dentro das cotas gratuitas. Proteções:
  - no máximo 2 instâncias;
  - alerta de orçamento de R$ 5 (avisos em 50%, 90% e 100%);
  - limpeza automática das imagens (ficam só as 2 mais recentes) e dos fontes de build (apagados após 7 dias).

### Como publicar uma nova versão

Exige o `gcloud` e o `firebase` logados com a conta dona do projeto. Com mais de uma conta no Firebase CLI, rode
`firebase login:use <conta>` na raiz do repositório (vale só para esta pasta) ou passe `--account <conta>`.

```bash
# API: nova imagem e nova revisão (o serviço mantém variáveis, segredo e identidade)
gcloud builds submit backend --project sesi-catalogo-cursos \
  --tag southamerica-east1-docker.pkg.dev/sesi-catalogo-cursos/course-catalog/api:<versão>
gcloud run deploy course-catalog-api --region southamerica-east1 --project sesi-catalogo-cursos \
  --image southamerica-east1-docker.pkg.dev/sesi-catalogo-cursos/course-catalog/api:<versão>

# Banco: migration nova ou mudança no seed (a credencial vai do Secret Manager direto para o processo)
cd backend
ConnectionStrings__CatalogAdmin="$(gcloud secrets versions access latest --secret=catalog-owner-connection --project sesi-catalogo-cursos)" \
  DOTNET_ENVIRONMENT=Production dotnet run --project src/CourseCatalog.DbMigrator --no-launch-profile
cd ..

# Site: o build roda sozinho antes do envio (predeploy do firebase.json)
firebase deploy --only hosting --project sesi-catalogo-cursos
```

### Arquivos de publicação (ZIP)

```bash
./scripts/gerar-zip-publicacao.sh
```

Gera `entrega/sesi-catalogo-cursos-publicacao.zip`, que é entregue à parte e não vai para o git. Ele contém:
- `site/`: build do front publicado;
- `api/`: API publicada com `dotnet publish`;
- `migrador/`: o DbMigrator, com o seed;
- `banco/`: `setup.sql` e o esquema em SQL, gerado das migrations;
- `config/`: `firebase.json`, `.firebaserc` e `Dockerfile`;
- um `LEIA-ME.md` que descreve cada pasta.

Nenhum segredo vai no arquivo.

### Como derrubar depois da avaliação

1. Google Cloud: `gcloud projects delete sesi-catalogo-cursos`. Remove a API, o site, as imagens e os
   segredos, e as cobranças param na hora. O projeto ainda pode ser recuperado por 30 dias.
2. Neon: no console, abra o projeto `sesi-catalogo-cursos`, vá em **Settings** e clique em **Delete project**.
3. O alerta de orçamento fica na conta de faturamento: apague o `sesi-catalogo-cursos` em
   **Faturamento → Orçamentos e alertas** no console do Google Cloud.

## 12. Diferenças em relação ao Figma

A fidelidade foi conferida pixel a pixel em 1366 px:

- **Como:** as três telas do protótipo foram capturadas em escala 1:1 (Chrome headless) e comparadas com a
  aplicação seção por seção: posições, espaçamentos, tamanhos, ordem e cores.
- **Grade:** a aplicação segue a do Figma, com 12 colunas e 16 px entre elas.
- **Tolerância:** restam diferenças de até 4 px no posicionamento de textos. Elas vêm de o Figma e os
  navegadores usarem métricas diferentes da fonte.

As diferenças intencionais estão abaixo.

| # | Diferença | Justificativa |
| - | --------- | ------------- |
| 1 | **Página de catálogo (`/cursos`) criada sem tela no Figma** | O protótipo não tem a listagem com busca/filtros exigida. Ela foi construída com os mesmos componentes e tokens do Figma (cards, tags, botões, tipografia, cores), como permite o enunciado. |
| 2 | Cards do catálogo exibem status, modalidade e carga horária | Informações obrigatórias do enunciado; no carrossel da home o card segue exatamente o Figma. |
| 3 | Página do curso exibe modalidade, carga horária, público-alvo e selo de status | Campos obrigatórios que o protótipo não mostrava; usam o mesmo estilo dos itens existentes ("ícone + rótulo: valor"). Com eles o texto do topo fica mais alto que a imagem: a imagem mantém a posição do Figma e as seções seguintes descem cerca de 30 px. |
| 4 | Os 2 cursos que não aparecem no Figma usam recortes das fotos do pacote | Os outros 6 usam as fotos originais do protótipo, com o mesmo enquadramento dos cards do Figma. Elas não vieram no pacote de materiais e foram baixadas do próprio protótipo. |
| 5 | O destaque da página do curso mostra a foto do curso, sem "play" (no Figma é a miniatura do vídeo institucional) | Cada curso tem a sua imagem nos dados e não há vídeos fornecidos. A miniatura de vídeo do Figma (véu escuro e selo de "play") foi mantida na home. |
| 6 | Cores de "Linguagens" e "Sustentabilidade" | O Figma só mostra Matemática (#FCD19C) e Ciências da Natureza (#E4CCFF); os ícones das outras categorias foram fornecidos e as cores foram escolhidas na mesma família de tons pastel. |
| 7 | Botão "Matricule-se" leva ao AVA (matrícula simulada) e depende do status | O protótipo não define o destino; a regra de negócio impede matrícula em cursos "Em breve"/"Encerrado". |
| 8 | "Área do aluno" abre o AVA do curso "Matemática para a Precisão" | Mesmo fluxo do protótipo (fluxo 03); não há autenticação no escopo. |
| 9 | AVA: títulos reais dos módulos (o Figma usa "Módulo 1", "Módulo 2"…) e progresso calculado | Os módulos e o progresso vêm dos dados do curso. O menu mantém os 190 px do Figma, então títulos longos ocupam duas ou três linhas. |
| 10 | "Cursos populares" do rodapé levam ao catálogo | Os nomes e a ordem são os do Figma, mas esses cursos não existem no catálogo fictício; por isso os links abrem o catálogo completo. |
| 11 | Páginas do rodapé (Termos, Blog etc.) exibem "em construção" | Fora do escopo da atividade. |
| 12 | Respostas do FAQ e o título "Aulas … e avaliações" variam conforme a modalidade | Evita informações contraditórias (ex.: curso presencial "totalmente online"). |
| 13 | Áreas de toque maiores que o desenho, sem mudar o visual (ícones sociais com 32 × 32 px; setas e botões com 40–48 px) | Acessibilidade (WCAG 2.2, área mínima de 24 px; ver seção 10). A busca do AVA mantém os 28 px do Figma. |
| 14 | Layouts para tablet e celular (ex.: filtros recolhíveis, rodapé em grade, estatísticas empilhadas) | O protótipo tem apenas a versão desktop (1366 px); as adaptações estão descritas na seção 9. |
| 15 | Setas dos carrosséis ficam esmaecidas quando não há mais itens naquela direção | O Figma mostra as duas setas sempre ativas; o estado desativado evita um clique sem efeito e é anunciado por leitores de tela. |
| 16 | AVA: botões "Aula anterior", "Marcar como concluída" e "Próxima aula" no fim de cada aula | O protótipo mostra a barra de progresso, mas não como o aluno conclui uma aula; sem esses botões o progresso nunca mudaria. Seguem o padrão de AVAs como o Moodle e usam os estilos de botão do Figma. |
| 17 | AVA: textos das aulas "Boas práticas" e "Recomendações" adaptados para servir a qualquer curso | No Figma eles citam o curso de Matemática e as "Recomendações" falam em escolher um curso, o que não cabe a quem já está matriculado. Títulos, ordem e espaçamentos são os do protótipo. |
| 18 | Botão "Acessibilidade" (ícone) no cabeçalho, à esquerda de "Início", e na faixa do menu do AVA | Abre as preferências de acessibilidade (seção 10). Os itens do menu continuam nas posições do protótipo. |
| 19 | Link "Acessibilidade" na coluna "Suporte" do rodapé e página `/acessibilidade` | Declaração de acessibilidade em todas as páginas, como recomendam a W3C e o eMAG. |
| 20 | Contorno da busca do AVA mais escuro (#8A8A8A em vez do #D9D9D9 do Figma) | Campos de formulário precisam de 3:1 de contraste com o fundo (WCAG 1.4.11); os campos do catálogo usam a mesma cor. |

## 13. Limitações conhecidas e itens não concluídos

- **Primeiro acesso depois de um tempo sem uso:** a API (Cloud Run) e o banco (Neon) desligam quando
  ninguém usa. A primeira consulta leva cerca de 2 a 3 s (medido: 2,3 s); as seguintes, de 0,1 a 0,5 s.
- **Limite por IP na publicação:** pelo Firebase, a API recebe o IP de saída do Firebase, não o do usuário,
  porque ela só confia no último salto do `X-Forwarded-For`. Assim, o limite de 300 por minuto vale por IP
  de borda do Firebase e por instância. As proteções que não dependem do IP continuam valendo: 64
  requisições simultâneas por instância, no máximo 2 instâncias e o cache.
- **VLibras:**
  - O tradutor tenta enviar dados de uso para um serviço de terceiros (PostHog). A CSP do site bloqueia
    esse envio (o console mostra os bloqueios), e o tradutor funciona normalmente.
  - A CSP do site aceita estilos inline (`style-src 'unsafe-inline'`), porque o VLibras injeta estilos na
    página. Para scripts, a regra continua estrita: só os do próprio site, liberados por hash, e os dos
    domínios do VLibras. A CSP da API é ainda mais restrita (`default-src 'none'`).
- **Versões do PostgreSQL:** na publicação, o Neon usa a 18; os testes automatizados rodam na 17 (a local).
  A API funciona com a 15 ou mais nova.
- A API é somente leitura: cadastro, edição e exclusão de cursos estão fora do escopo do enunciado. Para
  mudar o catálogo, edite `data/courses.seed.json` e rode o `CourseCatalog.DbMigrator`.
- Os testes de integração do back-end precisam de um PostgreSQL acessível e do `psql`; os comandos para
  Windows (seção 5) não foram executados neste ambiente (desenvolvido em macOS).
- Os textos das aulas no AVA e o progresso do aluno são demonstrativos (progresso salvo no `localStorage`);
  não há autenticação nem integração real com o Moodle (opcional no enunciado).
- Não há vídeo: a miniatura com "play" da home é ilustrativa.
- Acessibilidade: as verificações foram automáticas e manuais (seção 10); ainda não houve testes com pessoas
  com deficiência nem com leitores de tela em todos os sistemas. O VLibras depende do serviço do Governo Federal.
- A busca considera apenas o nome (completo e breve), como pede o enunciado.
- Os filtros aceitam um valor por vez (ex.: uma categoria por consulta).
