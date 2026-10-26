# Arquivos de publicação — Catálogo de Cursos SESI Indústria

- Aplicação publicada: <https://sesi-catalogo-cursos.web.app>
- Código-fonte: <https://github.com/KaianNovais/sesi-catalogo-cursos>
- Gerado por `scripts/gerar-zip-publicacao.sh` (README, seção 11).

| Pasta | Conteúdo | Onde é usado |
| ----- | -------- | ------------ |
| `site/` | Build de produção do front-end (React), que chama `/api` na própria origem | Firebase Hosting |
| `api/` | API .NET 10 publicada (`CourseCatalog.Api.dll`) | Contêiner no Google Cloud Run, com a imagem do `config/Dockerfile` |
| `migrador/` | `CourseCatalog.DbMigrator` publicado, com os dados fictícios (`courses.seed.json`) | Executado contra o banco para aplicar migrations, seed e permissões |
| `banco/setup.sql` | Cria os usuários (dono e somente leitura) e o banco | Executado uma vez no PostgreSQL (Neon) |
| `banco/migrations.sql` | Esquema do banco em SQL, idempotente, gerado das migrations do EF Core | Referência; o migrador aplica o mesmo esquema |
| `config/` | `firebase.json` (repasse de `/api`, cabeçalhos de segurança, CSP e cache), `.firebaserc` e `Dockerfile` da API | Configuração da publicação |

**Nenhum segredo está incluído.** As connection strings ficam no Secret Manager do Google (produção) e no
`dotnet user-secrets` (execução local).

Para rodar a API a partir destes arquivos, é preciso o runtime ASP.NET Core 10 e um PostgreSQL preparado com
o `setup.sql` e o migrador:

```bash
ConnectionStrings__Catalog="Host=localhost;Database=course_catalog;Username=catalog_api;Password=<senha>" \
  dotnet api/CourseCatalog.Api.dll
```

O passo a passo completo (banco, migrador, API e front-end) está no README, seções 5, 6 e 11.
