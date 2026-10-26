<!--
  Instruções para agentes de IA (Claude Code, Codex, Cursor, Copilot, Gemini CLI...).
  Dono: autor do projeto. Revise mudanças neste arquivo como código e mantenha-o curto (< 100 linhas).
  Não crie CLAUDE.md nem CLAUDE.local.md: no Claude Code, qualquer um deles faz os AGENTS.md
  deixarem de ser lidos. Racional e fontes oficiais: docs/desenvolvimento-com-ia.md
-->

# Catálogo de Cursos — SESI Indústria (CTED)

Atividade prática do processo seletivo SESI-SP/SENAI (Desenvolvedor de Sistemas I): aplicação web com
o catálogo de cursos de um AVA (estilo Moodle) — listar, pesquisar, filtrar e ver detalhes.
O `README.md` é a documentação oficial da entrega; o resumo dos requisitos do edital está em
`.claude/skills/checklist-entrega/SKILL.md`.

## Mapa do repositório

- `frontend/` — React 19 + Vite + TypeScript em Clean Architecture → `frontend/AGENTS.md`
- `backend/` — API .NET 10 + PostgreSQL, somente leitura, com o contrato do README §7 → `backend/AGENTS.md`
- `data/courses.seed.json` — dados fictícios: mock do front e seed do banco (fonte única) → `data/AGENTS.md`
- `docs/` — documentação complementar
- `firebase.json` — publicação: site no Firebase Hosting, `/api` para o Cloud Run, banco no Neon (README §11)
- `.claude/` — configuração compartilhada do Claude Code: permissões, hooks, skills, subagente e regras

## Comandos (dentro de `frontend/`)

- `npm install` — exige Node ≥ 22.12
- `npm run check` — typecheck + lint + formatação + testes. **Rode antes de considerar uma tarefa concluída.**
- `npm run dev` — <http://localhost:5173> com dados fictícios em memória
- `npm run test -- src/caminho/arquivo.test.tsx` — um único arquivo de teste
- `npm run format` — aplica o Prettier
- `npm run build` e depois `npm run preview` — build de produção em <http://localhost:4173>
- Back-end (dentro de `backend/`): `dotnet build`, `dotnet format --verify-no-changes` e `dotnet test`.
  Detalhes em `backend/AGENTS.md`.

## Regras do edital (valem para qualquer mudança)

- Todos os dados são fictícios: nunca use nomes, contatos ou dados reais de pessoas e empresas.
- Custo zero: hospedagem, banco e serviços só em planos gratuitos; não adicione dependência ou serviço pago.
- Interface e documentação em português do Brasil; identificadores de código em inglês.
- Funcionar de 320 px a 1920 px e seguir a WCAG 2.2 AA são requisitos, não extras. Telas novas também precisam
  funcionar com as preferências do menu "Acessibilidade" (alto contraste, texto a 150%, espaçamento; README §10).
- Diferenças em relação ao Figma são registradas e justificadas no README §12.
- Fora do escopo: cadastro, edição e exclusão de cursos.
- Segredos (senhas, connection strings) nunca em arquivo versionado: `dotnet user-secrets` ou variáveis
  de ambiente no back-end; `.env.local` no front-end.

## Fluxo de trabalho

- Mudança em várias camadas ou com abordagem incerta: explore e planeje antes de editar.
- Ao concluir, mostre evidência (comando executado e resultado, ou screenshot), não apenas "feito".
- Mudou comportamento, contrato da API, modelo de dados, scripts ou estrutura de pastas? Atualize o
  README na mesma tarefa.
- Cada etapa feita com IA é registrada em `USO_DE_IA.md` (o autor dispara `/registrar-uso-ia`), revisada
  e reescrita por ele com as próprias palavras. Nunca invente prompts, números ou resultados.
- Commit e push só quando o autor pedir (ainda não há repositório git).

## Claude Code neste repositório

- Abra a sessão na raiz `sesi-catalogo-cursos/`: o `.claude/settings.json` só é lido no diretório
  onde a sessão começa.
- Hooks: o Prettier formata cada arquivo editado em `frontend/`. Ao fim de um turno que alterou
  `frontend/`, `backend/` ou `data/`, roda a verificação da parte alterada (`npm run check`; build,
  format e testes do .NET) e, se falhar, o turno continua para a correção.
- Skills que o Claude usa quando a tarefa pede: `/novo-componente` e `/auditoria-responsiva`.
  Comandos que só o autor dispara (execução longa ou efeitos colaterais): `/auditoria-lighthouse`,
  `/registrar-uso-ia` e `/checklist-entrega`.
- Subagente `revisor-codigo`: revisão em contexto limpo antes de dar uma tarefa por concluída.
