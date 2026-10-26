# Desenvolvimento com agentes de IA

Este repositório é preparado para ser desenvolvido com agentes de código (Claude Code, Codex, Cursor,
GitHub Copilot, Gemini CLI e outros) de forma previsível: as instruções ficam versionadas junto com o
código, os comandos de verificação são os mesmos para pessoas e agentes, e o que **precisa** acontecer
sempre (formatação, testes antes de concluir) é garantido por automação, não por pedido.

A organização segue a documentação oficial do Claude Code (Anthropic) e o padrão aberto
[AGENTS.md](https://agents.md/). As fontes estão no fim deste documento.

## Como usar

1. Instale as dependências do front-end: `cd frontend && npm install`. Sem elas, os hooks não fazem
   nada (não bloqueiam ninguém).
2. Abra o Claude Code (v2.1.277 ou mais recente) **na raiz `sesi-catalogo-cursos/`**. O
   `.claude/settings.json` é lido apenas do diretório onde a sessão começa.
3. Aceite o diálogo de confiança da pasta. Ele libera as regras `allow` do projeto; as regras `ask` e
   `deny` valem desde o início.
4. Para conferir: `/memory` lista os `AGENTS.md` carregados, `/hooks` mostra os hooks e `/agents` mostra
   o subagente. Também dá para usar `/context` (uso de contexto) e `/status` (arquivos de configuração lidos).

Preferências pessoais ficam em `~/.claude/CLAUDE.md` ou em `.claude/settings.local.json` (ignorado
pelo git). **Não crie `CLAUDE.md` nem `CLAUDE.local.md` no projeto**: no Claude Code, qualquer um deles,
no diretório da sessão ou acima, faz os `AGENTS.md` deixarem de ser lidos.

## Estrutura

```
sesi-catalogo-cursos/
├── AGENTS.md                         # Visão geral, comandos, regras do edital e fluxo (carregado no início)
├── data/AGENTS.md                    # Contrato do seed de dados fictícios
├── backend/AGENTS.md                 # Camadas, comandos e regras do back-end (.NET + PostgreSQL)
├── frontend/
│   ├── AGENTS.md                     # Stack, camadas, armadilhas e orçamento de qualidade
│   └── src/
│       ├── domain/AGENTS.md          # Regras da camada de domínio
│       ├── infrastructure/AGENTS.md  # Adaptadores e paridade mock ↔ API
│       └── presentation/AGENTS.md    # Componentes, estados de tela e acessibilidade
├── docs/desenvolvimento-com-ia.md    # Este documento
└── .claude/
    ├── settings.json                 # Permissões e hooks (compartilhado e versionado)
    ├── launch.json                   # Servidores de dev e preview para o navegador do app desktop
    ├── hooks/
    │   ├── format-edited-file.mjs    # PostToolUse: Prettier no arquivo editado
    │   └── verify-changes.mjs        # SessionStart + Stop: portão de verificação (front e back-end)
    ├── rules/
    │   ├── testes.md                 # Carregada ao abrir arquivos *.test.ts(x)
    │   └── estilos.md                # Carregada ao abrir arquivos .css
    ├── skills/
    │   ├── novo-componente/          # Reuso antes de criar; padrão de componente
    │   ├── auditoria-responsiva/     # Matriz de larguras + scripts/overflow-check.js
    │   ├── auditoria-lighthouse/     # Notas mobile/desktop + scripts/lighthouse.mjs
    │   ├── registrar-uso-ia/         # Nova etapa no USO_DE_IA.md (formato do edital)
    │   └── checklist-entrega/        # Requisitos e entregáveis do edital
    └── agents/
        └── revisor-codigo.md         # Revisão em contexto limpo
```

## Recomendações oficiais e onde estão no projeto

| Recomendação | Onde está | Fonte |
| ------------ | --------- | ----- |
| Instruções persistentes curtas, versionadas e com dono; só o que o agente não deduz do código (meta: menos de 200 linhas por arquivo) | `AGENTS.md` (sete arquivos, o maior com cerca de 65 linhas; os das subpastas só carregam quando o agente trabalha nelas) | [Memory](https://code.claude.com/docs/en/memory), [Best practices](https://code.claude.com/docs/en/best-practices) |
| Instruções por diretório, carregadas só quando o agente trabalha naquela parte do código | `AGENTS.md` em `data/`, `backend/`, `frontend/` e nas camadas do front | [Large codebases](https://code.claude.com/docs/en/large-codebases), [Memory › AGENTS.md](https://code.claude.com/docs/en/memory#agents-md) |
| Regras com escopo por caminho para convenções espalhadas pela árvore | `.claude/rules/` (`paths:` para testes e CSS) | [Memory › rules](https://code.claude.com/docs/en/memory#organize-rules-with-claude/rules/) |
| Dar ao agente uma forma de verificar o próprio trabalho | `npm run check` (front), `dotnet build`/`format`/`test` (back) + hook `Stop` que os executa | [Best practices](https://code.claude.com/docs/en/best-practices#give-claude-a-way-to-verify-its-work) |
| O que precisa acontecer sempre vai para hook; instrução é orientação | Hooks de formatação e de verificação | [Hooks guide](https://code.claude.com/docs/en/hooks-guide), [Features overview](https://code.claude.com/docs/en/features-overview) |
| Permissões são a barreira real, não o texto das instruções | `permissions` em `.claude/settings.json` | [Permissions](https://code.claude.com/docs/en/permissions), [Settings](https://code.claude.com/docs/en/settings) |
| Procedimentos e conhecimento ocasional em skills (carregadas sob demanda); efeitos colaterais só por comando explícito | 5 skills; 3 com `disable-model-invocation: true` | [Skills](https://code.claude.com/docs/en/skills) |
| Revisão por subagente em contexto limpo, apontando só o que afeta correção e requisitos | `.claude/agents/revisor-codigo.md` | [Best practices › adversarial review](https://code.claude.com/docs/en/best-practices#add-an-adversarial-review-step), [Subagents](https://code.claude.com/docs/en/sub-agents) |
| Explorar → planejar → implementar → verificar; mostrar evidência; `/clear` entre tarefas não relacionadas | Seção "Fluxo de trabalho" do `AGENTS.md` raiz | [Best practices](https://code.claude.com/docs/en/best-practices) |
| Adicionar recursos aos poucos, quando houver motivo concreto (um erro que se repete, um procedimento colado várias vezes) | Cada skill corresponde a uma tarefa já repetida no projeto (auditorias, registro de IA, componentes) | [Features overview › build your setup over time](https://code.claude.com/docs/en/features-overview#build-your-setup-over-time) |

## Decisões e trade-offs

- **AGENTS.md como fonte única, sem CLAUDE.md.** O AGENTS.md é um padrão aberto (mantido pela Agentic
  AI Foundation, da Linux Foundation) lido por dezenas de ferramentas, e o Claude Code o lê diretamente
  desde a v2.1.277. Pela documentação oficial, um `CLAUDE.md`, `.claude/CLAUDE.md` ou `CLAUDE.local.md`
  no diretório da sessão ou acima faz o Claude Code ler só os `CLAUDE.md`, e os `AGENTS.md` das
  subpastas deixariam de carregar. Em versões antigas (ou sessões sem suporte), a alternativa oficial é
  um `CLAUDE.md` com a linha `@AGENTS.md` ao lado de cada `AGENTS.md`. Aqui preferimos atualizar o
  Claude Code a duplicar arquivos.
- **Hooks escritos em Node, não em bash + jq.** O projeto já exige Node, e os scripts rodam igual em
  macOS, Linux e Windows. Os caminhos usam `"$CLAUDE_PROJECT_DIR"`, como recomenda a documentação.
- **Portão de verificação sem git.** Ainda não há repositório, então o hook marca o início da sessão
  (`SessionStart`) e, a cada fim de turno (`Stop`), compara essa marca com o horário de modificação dos
  arquivos e pastas de `frontend/`, `backend/` e `data/`. Assim pega também edições feitas por comando e
  arquivos apagados. Roda só a verificação da parte alterada: `npm run check` no front (cerca de 5 s);
  `dotnet build`, `dotnet format --verify-no-changes` e `dotnet test` no back (cerca de 15 s, com o
  PostgreSQL local rodando). Se passar, avança a marca; se falhar, devolve o erro e o Claude continua o
  turno para corrigir. O hook encontra o SDK do .NET mesmo fora do PATH do aplicativo. Para não prender o agente em laço, o hook
  libera quando o turno já foi estendido por ele (`stop_hook_active`), e o próprio Claude Code limita a
  8 continuações seguidas. Sem `node_modules`, o hook não bloqueia.
- **Formatação depois de cada edição.** Mantém o código uniforme mesmo quando várias pessoas e agentes
  editam. Custo conhecido: depois que o Prettier reformata um arquivo, o agente pode precisar relê-lo
  antes da próxima edição. O Prettier não formata Markdown (`.prettierignore`), para não mexer na
  documentação escrita à mão.
- **Permissões mínimas.** Sem perguntar, só os scripts de verificação (`check`, `typecheck`, `lint`,
  `test`, `build`, `format` e os equivalentes `dotnet build`, `test`, `format`, `restore`).
  `git push` sempre pede confirmação. As connection strings locais do back-end ficam no
  `dotnet user-secrets`, e o agente não pode lê-las (`Read(~/.microsoft/usersecrets/**)` e
  `dotnet user-secrets list` negados). A leitura de `.env`, `.env.local` e
  `.env.*.local` (onde ficam segredos locais) é negada, o que também impede o agente de editá-los: quem
  cria o `frontend/.env.local` (README §5) é a própria pessoa. `.env.development`, `.env.production` e
  `.env.example` são públicos por definição (variáveis `VITE_` vão para o bundle) e podem ser lidos.
- **Um subagente só.** Um "auditor de acessibilidade" separado foi descartado: repetiria as skills de
  auditoria, e um subagente não controla o navegador. A acessibilidade entra no checklist do
  `revisor-codigo` e no Lighthouse. Isso é necessário porque o `eslint-plugin-jsx-a11y` não é
  compatível com o ESLint 10.

## O que ficou de fora, e por quê

| Recurso | Motivo |
| ------- | ------ |
| `CLAUDE.md` / `CLAUDE.local.md` | Desligariam a leitura dos `AGENTS.md` (ver acima). |
| Servidores MCP (`.mcp.json`) | Nenhum sistema externo é necessário; o arquivo de design do Figma é restrito. |
| Plugins / marketplace | Um único repositório; empacotar a configuração seria prematuro. |
| Output styles | Não há necessidade de mudar o formato das respostas. |
| Claude Code no GitHub Actions | Exigiria chave de API paga, o que viola a regra de custo zero do edital. |
| Sandbox (`/sandbox`) | É configuração da máquina de cada pessoa; recomendado, mas não versionado. |
| Plugin de *code intelligence* (LSP) | Opcional numa base de código deste tamanho. |

## Manutenção

- Trate os `AGENTS.md` como código: revise as mudanças, corte o que o agente já faz certo sozinho e
  acrescente uma regra quando ele errar a mesma coisa duas vezes.
- Quando uma regra precisar valer **sempre**, transforme-a em hook ou permissão em vez de reforçar o texto.
- Revise as instruções depois de grandes atualizações de modelo; algumas deixam de ser necessárias.
- O comando `/doctor prompt-audit` (Claude Code v2.1.283+) audita `AGENTS.md`, regras, skills e subagentes.

## Fontes

Documentação oficial do Claude Code (Anthropic):

- [Manage Claude's memory](https://code.claude.com/docs/en/memory) — CLAUDE.md, AGENTS.md, regras e carregamento sob demanda
- [Best practices for Claude Code](https://code.claude.com/docs/en/best-practices)
- [Extend Claude Code (features overview)](https://code.claude.com/docs/en/features-overview)
- [Explore the .claude directory](https://code.claude.com/docs/en/claude-directory)
- [Set up Claude Code in a monorepo or large codebase](https://code.claude.com/docs/en/large-codebases)
- [Skills](https://code.claude.com/docs/en/skills) · [Subagents](https://code.claude.com/docs/en/sub-agents)
- [Automate actions with hooks](https://code.claude.com/docs/en/hooks-guide) · [Hooks reference](https://code.claude.com/docs/en/hooks)
- [Configure permissions](https://code.claude.com/docs/en/permissions) · [Settings](https://code.claude.com/docs/en/settings)
- [Steering Claude Code: when to use CLAUDE.md, skills, hooks, and subagents](https://claude.com/blog/steering-claude-code-skills-hooks-rules-subagents-and-more) (blog da Anthropic)

Padrão aberto: [AGENTS.md](https://agents.md/).
