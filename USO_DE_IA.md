# Uso de Inteligência Artificial

Registro do uso de IA no desenvolvimento desta atividade, conforme o item 4.d do enunciado.
Este documento cobre todas as etapas:
- **front-end:** construção, responsividade/performance, fidelidade ao Figma, acessibilidade e revisão;
- **preparação do repositório** para desenvolvimento com agentes de IA;
- **back-end** e **publicação**.

## 1. Ferramenta utilizada

- **Claude Code** (Anthropic), modelo **Claude Opus 5.5**, no aplicativo desktop do Claude.
- **Recursos usados:**
  - leitura e escrita de arquivos do projeto;
  - execução de comandos (npm, testes e build; `dotnet`, `psql`, `gcloud` e `firebase` no back-end e na
    publicação);
  - navegador integrado para conferir a aplicação;
  - extensão do Chrome para inspecionar o protótipo no Figma e o console do Neon;
  - subagentes para revisão independente.

## 2. Objetivo do uso

A IA foi usada como **par de programação**, sob direção do candidato, para:

1. **Extrair as especificações do protótipo** (o arquivo de design do Figma é restrito; só o protótipo é público):
   navegar pelos três fluxos, medir tamanhos de fonte, espaçamentos e cores a partir das capturas de tela.
2. **Propor e implementar a arquitetura** do front-end (Clean Architecture em React) e os componentes.
3. **Gerar os dados fictícios** (8 cursos com módulos, aulas e públicos-alvo) respeitando os mínimos do enunciado.
4. **Escrever testes automatizados** e **revisar acessibilidade e responsividade**.
5. **Redigir a documentação** (README e este arquivo).

## 3. Prompts relevantes

### Prompt inicial (resumo do pedido do candidato)

> "Crie uma nova pasta para um projeto que tenho que entregar [...] O projeto já está no Figma [...] Pode
> entrar no meu Chrome e acessar e fazer conforme o Figma. [...] Pode usar o React mesmo, seguindo as
> melhores práticas atuais, como por ex.: criar componentes e reutilizar, nunca repetir componentes,
> organizar o projeto de forma limpa usando clean architecture. Use o React na versão mais recente [...]
> Inicialmente, pode começar com o front, depois iremos pro back."

Junto com o prompt foram fornecidos o enunciado da atividade, a descrição da vaga e o pacote de imagens/ícones.

### O que foi aproveitado

| Sugestão da IA | Como foi usada |
| -------------- | -------------- |
| Medir o protótipo com precisão em vez de "estimar no olho" | As fontes foram identificadas comparando a largura dos textos nas capturas com a largura calculada a partir dos arquivos da própria fonte Open Sans (ex.: título do hero = Bold 72 px; títulos de seção = Bold 40 px; menu = SemiBold 16 px). As cores foram amostradas dos pixels (ex.: card `#9A0313`, depoimentos `#890100`, rodapé `#1D0300`). |
| Front-end "API first" com repositório em memória | O front consome um contrato de API; enquanto o back-end não existe, um repositório mock lê o mesmo arquivo de seed que vai popular o banco. Evita retrabalho e permitiu testar carregamento, vazio e erro. |
| Filtros sincronizados com a URL | Busca e filtros podem ser compartilhados e respeitam voltar/avançar. |
| Regra de negócio de matrícula por status | Cursos "Em breve"/"Encerrado" não permitem matrícula; o AVA só libera conteúdo a partir da data de disponibilização. |
| Gerar os ícones a partir dos SVGs | Os SVGs fornecidos e os Material Symbols (mesma família do Figma) viraram um registro tipado de ícones com `currentColor`, sem dependência em tempo de execução. |
| Otimizar as imagens | Script com `sharp` converteu os PNGs (~10 MB) para WebP (~600 KB) em várias larguras. |

### O que foi descartado ou ajustado

| Sugestão / tentativa | Motivo do descarte |
| -------------------- | ------------------ |
| Solicitar acesso ao arquivo de design do Figma | Seria uma ação em nome do candidato junto ao dono do arquivo; o trabalho foi feito apenas com o protótipo público. |
| Plugin `vite-plugin-svgr` + pacote de ícones como dependência | Substituído por um registro de ícones gerado uma única vez: menos dependências e build mais simples. |
| `eslint-plugin-jsx-a11y` | Incompatível com o ESLint 10; a acessibilidade foi garantida por revisão manual e por testes que consultam a interface por papéis ARIA. |
| Véu do hero com `mix-blend-mode: multiply` | Não reproduzia a cor do Figma; a cor e a opacidade foram recalculadas a partir dos pixels amostrados do protótipo (`rgb(155 10 12 / 0.88)`). |
| `text-wrap: balance` em todos os títulos | Alterava as quebras de linha em relação ao Figma; mantido só onde o resultado é idêntico. |
| Texto do FAQ igual para todos os cursos | "O curso é totalmente online? Sim." seria falso para cursos presenciais; as respostas passaram a depender da modalidade. |
| Lista fixa de "Cursos populares" do rodapé do Figma | Citava cursos inexistentes no catálogo; passou a ser alimentada pela API. |

## 4. Como o conteúdo foi validado

1. **Verificações automáticas** a cada mudança: TypeScript em modo `strict`, ESLint (incluindo as regras
   do React Compiler), build de produção e testes automatizados (Vitest + Testing Library — 34 na primeira
   etapa, 37 após a segunda), entre eles:
   - os mínimos do enunciado sobre os dados (≥ 6 cursos, ≥ 3 categorias, ≥ 2 modalidades, ≥ 3 status, campos obrigatórios);
   - busca sem acentos, filtros combinados, estado vazio, limpar filtros, erro e "tentar novamente";
   - regra de matrícula por status e página de curso inexistente;
   - tradução de erros HTTP (404, 5xx, falha de rede) no cliente da API.
2. **Comparação visual com o Figma**, lado a lado, com a janela no mesmo tamanho do protótipo (1366 × 768).
3. **Teste manual de cada requisito funcional** no navegador: pesquisa, filtros, combinação, contagem,
   limpar, detalhes, mensagem de vazio, carregamento e erro (`?simularErro`).
4. **Teste de responsividade** em 375 px (celular) e em desktop, verificando ausência de rolagem horizontal.
5. **Revisão de acessibilidade**: contraste calculado (WCAG AA), navegação por teclado, papéis ARIA e
   anúncios para leitores de tela.

## 5. Exemplos de erros ou inadequações identificados e correções realizadas

### Exemplo principal — carrossel desalinhado por especificidade de CSS

- **Erro:** na primeira comparação com o Figma, o primeiro card do carrossel "Principais cursos" começava
  colado na borda esquerda da tela, em vez de alinhado ao conteúdo (108 px no frame de 1366 px).
- **Diagnóstico:** inspecionando o estilo calculado, o `padding` do carrossel era `0`. O reset global gerado
  `ul[role='list'] { padding: 0 }` tem especificidade (0,1,1) e vencia a classe do CSS Module (0,1,0).
- **Correção:** o reset passou a usar `:where(ul, ol)[role='list']`, que tem especificidade zero e nunca
  sobrescreve os estilos dos componentes.

### Outros casos

| Problema identificado | Correção |
| --------------------- | -------- |
| Suposição inicial de que o frame do Figma tinha 1440 px de largura. | Medição mostrou 1366 × 768; o container foi definido em 1150 px (margens de 108 px), igual ao protótipo. |
| No AVA, em 375 px, havia rolagem horizontal: o banner com `aspect-ratio` + altura mínima forçava a largura mínima da coluna do grid. | Coluna definida como `minmax(0, 1fr)` e altura do banner com `clamp()`. |
| O texto de cargo nos depoimentos (branco a 70% sobre vermelho) tinha contraste de 3,4:1, abaixo do mínimo AA. | Opacidade aumentada para 88% (≈ 4,6:1). |
| A extração do ZIP falhou com "Illegal byte sequence" por causa da codificação do nome da pasta ("SESI INDÚSTRIA"). | Extração feita com o utilitário `ditto`, que trata a codificação corretamente. |
| Erro de tipagem no mock de `fetch` de um teste. | Mock tipado com `vi.fn<typeof fetch>()`. |
| Em 320 px, o rodapé do carrossel ("Ver todos os cursos" + setas) gerava 4 px de rolagem horizontal. | O rodapé passou a quebrar linha (`flex-wrap`) com as setas alinhadas à direita. |
| No AVA, ao clicar em "Próxima aula" da última aula de um módulo, o módulo seguinte continuava recolhido no menu e a aula atual ficava escondida. | O módulo da aula atual passou a ficar sempre expandido. |

## 6. Segunda etapa — responsividade e performance

### Prompt

> "Parece que não está responsivo. Por mais que no Figma não tenha nada sobre, vamos deixar ele responsivo.
> Siga as melhores práticas de responsividade, performance também."

### O que a IA fez

1. **Auditoria** em 320, 360, 390, 768, 1024, 1366 e 1920 px e em 844 × 390 (celular deitado), nas quatro
   páginas, com capturas de tela e um script que mede rolagem horizontal. Nada "quebrava", mas a experiência
   fora do desktop tinha problemas — a IA também apontou que, durante a etapa anterior, o painel do navegador
   ficou emulando 1366 px reduzido para caber na tela, o que pode ter dado a impressão de layout fixo.
2. **Correções de responsividade:** filtros recolhíveis no celular, container queries, grade do rodapé,
   AVA em duas colunas a partir do tablet, áreas seguras do iPhone, título do hero sensível à altura da tela,
   hover só com mouse e campo de busca do AVA com 16 px.
3. **Performance:** fonte auto-hospedada com preload e fallback de métricas ajustadas, preload da imagem do
   hero, página inicial fora do lazy loading, prefetch por intenção, bibliotecas em arquivos próprios e
   imagens dos cursos em duas larguras.
4. **Medição com Lighthouse** antes e depois (resultados no README, seção 9).

### O que foi aproveitado ou descartado

| Sugestão / tentativa | Decisão |
| -------------------- | ------- |
| `content-visibility: auto` nas seções abaixo da dobra | Descartado: ganho pequeno numa página curta e risco de imprecisão ao rolar até a âncora `#sobre`. |
| Detectar celular com JavaScript (`matchMedia`) para recolher os filtros | Descartado: a visibilidade é decidida só por CSS (container query), sem divergência entre servidor/cliente e sem depender de JS para o layout. |
| Valores de `size-adjust` "de memória" para a fonte de fallback | Descartado: os valores foram calculados com opentype.js a partir dos arquivos da Open Sans e da Arial. |
| Pré-carregar a foto do hero em todas as páginas | Ajustado: o preload só acontece na página inicial, para não desperdiçar banda nas demais. |

### Validação

- Matriz de larguras sem nenhuma rolagem horizontal (inclusive com filtros, acordeões e sumário abertos).
- Conferência de que o layout do Figma em 1366 px continuou idêntico (área útil de 1150 px, cards de 275 px,
  título de 72 px, diferenciais em 3 e 4 colunas).
- Lighthouse mobile e desktop nas páginas Início, Catálogo e Detalhes.
- 37 testes automatizados (3 novos), além de TypeScript, ESLint e build.

### Erros identificados nesta etapa e correções

| Problema | Como foi encontrado | Correção |
| -------- | ------------------- | -------- |
| No celular, os filtros ocupavam a primeira tela inteira e os resultados só apareciam após rolar. | Auditoria visual em 390 px. | Busca sempre visível e filtros recolhidos em "Filtros (n)". |
| Diferenciais e rodapé com itens "órfãos" (3+1, 2+1) em tablets. | Auditoria em 768 e 1024 px. | Colunas por container query e pela quantidade de itens; rodapé com `grid-template-areas`. |
| Estatísticas quebravam de forma diferente em cada linha no celular. | Auditoria em 390 px. | Número e rótulo empilhados de forma consistente quando o espaço é estreito. |
| Campo de busca do AVA com 14 px causaria zoom automático no iOS. | Revisão de boas práticas mobile. | Fonte de 16 px. |
| **CLS de 0,36** na página do curso: o skeleton era mais baixo que a página e o rodapé "pulava" ao carregar os dados. | Lighthouse (desktop). | Skeleton com a altura da tela → CLS 0. |
| Ordem de títulos `h1 → h3` na seção de diferenciais (Acessibilidade 99). | Lighthouse. | Título `h2` (visualmente oculto) na seção → Acessibilidade 100. |
| Nome acessível do botão lido como "Filtros2ativos". | Teste automatizado com Testing Library. | `aria-label` explícito: "Filtros (2 ativos)". |
| `robots.txt` inexistente (a hospedagem devolvia o HTML da SPA) — SEO 92. | Lighthouse. | `public/robots.txt` → SEO 100. |
| Imagens dos cards em 1200 px onde 600 px bastavam. | Lighthouse ("Improve image delivery"). | Variantes de 600 px + `srcset`/`sizes`. |

## 7. Terceira etapa — base para desenvolvimento com agentes de IA

### Prompt

> "Agora, quero deixar a base sólida, bem fundamentada. Vá até a doc oficial da Anthropic e veja quais são
> as recomendações quanto à arquitetura de projetos para o uso de IA. Por exemplo, lendo esses dias, vi que
> eles atualizaram recentemente que agora podemos ter arquivos agents.md em cada subpasta. Depois de reunir
> as principais recomendações oficiais (pode inclusive pesquisar na internet e confirmar na doc oficial),
> organize nosso projeto para refletir essa arquitetura da Anthropic."
>
> Complemento durante a execução: "além desses agentes, tem outras boas práticas também… quero as
> principais que fazem sentido pro nosso projeto."

### O que a IA fez

1. **Pesquisa na documentação oficial do Claude Code**: memória e AGENTS.md, boas práticas, visão geral
   dos recursos, diretório `.claude`, monorepos, skills, subagentes, hooks, permissões e configurações.
   Também consultou o site do padrão AGENTS.md e confirmou que a versão instalada (2.1.310) lê AGENTS.md
   diretamente, o que exige a 2.1.277 ou mais recente.
2. **AGENTS.md por pasta** (raiz, `data/`, `frontend/` e as camadas `domain`, `infrastructure` e
   `presentation`), só com o que o agente não consegue deduzir do código.
3. **`.claude/` compartilhado**, com:
   - permissões mínimas;
   - hook que formata cada arquivo editado;
   - portão que roda `npm run check` antes de o agente encerrar o turno;
   - duas regras por caminho (testes e CSS);
   - cinco skills: novo componente, auditoria responsiva, Lighthouse, registro de uso de IA e checklist do edital;
   - um subagente revisor.
4. **Prettier** no front-end. A formatação inicial mexeu em 38 arquivos, sem mudança de comportamento.
   Também foi criado o script `npm run check`.
5. **Documentação**: [`docs/desenvolvimento-com-ia.md`](docs/desenvolvimento-com-ia.md) (recomendação →
   onde está no projeto → fonte oficial) e atualização do README.

### O que foi aproveitado ou descartado

| Sugestão / tentativa | Decisão |
| -------------------- | ------- |
| `CLAUDE.md` em cada pasta importando o `AGENTS.md` (`@AGENTS.md`) | Descartado: pela documentação oficial, um `CLAUDE.md` faz o Claude Code ignorar os `AGENTS.md`. O `AGENTS.md` sozinho é lido nativamente e também serve a outras ferramentas (Codex, Cursor, Copilot). |
| Subagente "auditor de acessibilidade" | Descartado na revisão do plano: repetiria as skills de auditoria, e um subagente não controla o navegador. |
| Hooks em bash + `jq`, como nos exemplos da documentação | Ajustado: reescritos em Node, que o projeto já exige, para funcionar também no Windows. |
| Portão de verificação baseado em `git status` | Ajustado: o projeto ainda não tem git; usa um marcador de tempo por sessão. |
| Prettier com a configuração padrão (80 colunas, aspas duplas) | Ajustado: aspas simples e 100 colunas, iguais ao estilo já usado, para reformatar o mínimo. |
| Servidores MCP, plugins e Claude no GitHub Actions | Descartados: sem necessidade no projeto. O Actions exigiria chave de API paga, o que viola o custo zero. |

### Validação

- `npm run check` (tipos, ESLint, formatação e 37 testes) e `npm run build` passando depois da formatação.
- Hooks testados com entradas simuladas **antes** de serem registrados:
  - o arquivo mal formatado foi corrigido, e um arquivo fora de `frontend/` ficou intocado;
  - o portão libera sem mudanças (~50 ms);
  - bloqueia com um teste que falha de propósito (código 2 e erro do Vitest);
  - libera quando o turno já foi estendido;
  - detecta arquivo apagado;
  - não roda de novo depois de passar.
- Sessão nova do Claude Code em modo não interativo (`claude -p`) aberta na raiz:
  - carregou o `AGENTS.md` da raiz no início e o de `frontend/` ao abrir um arquivo de lá;
  - o hook formatou o arquivo criado;
  - o portão rodou o `npm run check` no fim do turno;
  - listou as skills e o subagente.

  As regras `allow` do projeto só valem depois que a pasta é marcada como confiável, como diz a
  documentação.
- Script de overflow testado no navegador: nenhum falso positivo na página inicial (com carrossel) e no
  catálogo em 320 px; detectou um elemento de 500 px inserido de propósito.

### Erros identificados nesta etapa e correções

| Problema | Como foi encontrado | Correção |
| -------- | ------------------- | -------- |
| O resumo automático da página de hooks disse que a seção do evento `Stop` "não estava disponível". | A página tem cerca de 280 mil caracteres e a leitura foi truncada. | Leitura em trechos até a seção, conferindo os campos e o limite de 8 continuações. |
| A regra de permissão `Bash(npm run *)` não cobriria a forma `npm --prefix frontend run ...`. | Revisão do plano por um segundo modelo, antes da implementação. | Regras explícitas para as duas formas, só para os scripts de verificação. |
| O portão comparava só arquivos: apagar um arquivo não mudava nenhum horário e passaria sem verificação. | Planejamento dos testes do hook. | Passou a comparar também o horário das pastas (muda quando entra ou sai um arquivo), com teste dedicado. |
| O `AGENTS.md` da raiz indicava `/checklist-entrega` ao agente, mas skills com `disable-model-invocation` ficam invisíveis para o modelo. | Teste com a sessão nova, que listou só duas skills. | O `AGENTS.md` passou a apontar o arquivo da skill e a separar as skills dos comandos do autor. |

## 8. Quarta etapa — fidelidade ao Figma

### Prompt

> "Algumas obs: 1 - O espaçamento dos ícones inta, face e link não estão de acordo com o Figma. Corrija. 2 no
> rodapé, os cursos populares estão diferentes do Figma. 3 na seção principais cursos está diferente do Figma,
> principalmente a ordem dos cursos. Corrija esses 3 pontos e verifique se tem mais lugares que espaçamentos,
> tamanhos, ordens, ficaram diferentes"

Ao longo da etapa, o candidato acrescentou:
- "ao passar o mouse sobre um card do curso, os textos não ficam sublinhados, você colocou pra ficar.. pode
  remover.. [...] 2 - as fotos dos cursos estão diferentes";
- "na área-do-aluno achei que o menu lateral ficou muito curto";
- "Ficou faltando algo do Figma? tudo completinho? nada faltando, nada fora do lugar?";
- "quais foram as limitações que tivemos pelo fato do Figma não ter dado acesso? ou tinha mais tela no Figma
  e você não encontrou?"

### O que a IA fez

1. **Corrigiu os três pontos apontados** (ícones sociais, cursos populares do rodapé e ordem dos cursos)
   e fez uma auditoria de medidas contra o protótipo de 1366 px. As seções ficaram a até ±4 px.
2. **Hover:** removeu o sublinhado em 5 lugares. Testou o hover no próprio protótipo: lá o único efeito é o
   card de curso subir 8 px, e o nosso passou a fazer só isso.
3. **Fotos dos 6 cursos do Figma:**
   - baixadas do servidor de imagens do protótipo, com autorização do candidato;
   - recortadas com o zoom e o centro calculados para cada card;
   - véu vermelho refeito (quase transparente no topo);
   - contraste dos títulos medido: pior caso de 4,88:1.
4. **Filtro do catálogo:** a IA respondeu que ele não existe no Figma e avaliou a posição (barra acima dos
   resultados é o padrão quando há poucos filtros). Também corrigiu o exemplo do campo de busca, que saía
   cortado.
5. **Menu lateral do AVA:** o título quebrava diferente do Figma porque a barra de rolagem (15 px) espremia
   o menu. Agora só a lista de módulos rola.
6. **Checagem final:** achou 5 diferenças que a primeira passada não tinha visto:
   - altura da barra fixa;
   - véu e selo de "play" do vídeo;
   - texto do hero de 9 a 11 px abaixo;
   - bloco "Pronto para…" centralizado em vez de alinhado ao topo;
   - imagem do curso 14 px abaixo.
   
   Também comparou o estado aberto dos três acordeões.
7. **Limitações da falta de acesso ao arquivo de design**, explicadas ao candidato:
   - sem valores exatos nem exportação de imagens;
   - só os estados que estão no protótipo;
   - só o desktop;
   - sem tela de catálogo.
   
   A IA confirmou que o protótipo tem exatamente 3 fluxos. As diferenças intencionais ficaram no README §12.

### O que foi aproveitado ou descartado

| Sugestão / tentativa | Decisão |
| -------------------- | ------- |
| Filtro no catálogo (não existe no Figma, mas o edital exige filtros) | Mantido: o candidato aprovou ("Gostei que tenha colocado"). |
| "Ordenar por" e etiquetas removíveis dos filtros | Propostos pela IA; não foram pedidos. A ordenação também dependeria da API. |
| Zoom na foto e sombra maior no hover do card | Removidos: no Figma o card só sobe 8 px. |
| Textos das aulas do AVA adaptados aos 8 cursos | Mantidos e registrados no README §12; o candidato pode preferir o texto exato do Figma. |
| "Erro de digitação" do Figma registrado no README §12 | Removido: não havia erro (ver a tabela abaixo). |

### Validação

- Medições de posição e tamanho contra capturas 1:1 do protótipo. Depois da checagem final, o hero ficou
  a 1–3 px do Figma.
- `npm run check` (tipos, lint, Prettier e 38 testes) e build de produção.
- Lighthouse: catálogo no celular de 89 a 90 (três medições), página inicial 95, detalhes 93 e desktop 100.
- Nenhuma rolagem horizontal nas três telas.

### Erros identificados nesta etapa e correções

| Problema | Como foi encontrado | Correção |
| -------- | ------------------- | -------- |
| A foto do hero ficou limitada a 100% da largura e não cobria a parte de baixo. | Comparação lado a lado com o Figma. | Corrigido o enquadramento. |
| A primeira tentativa de achar o enquadramento das fotos errou, porque o texto e o véu atrapalhavam a comparação. | Comparação das fotos. | Zoom e centro calculados para cada card. |
| Trocar o rodapé pela lista do Figma derrubou o catálogo no celular de 90 para 89 no Lighthouse: o rodapé antigo fazia os dados carregarem cedo, sem querer. | Lighthouse. | Os dados passaram a carregar junto com o app, de propósito (documentado no README e no `frontend/AGENTS.md`). |
| O título do menu do AVA quebrava diferente do Figma. O teste anterior da IA não mostrou isso porque usava um Chrome que esconde as barras de rolagem. | Observação do candidato. | Só a lista de módulos rola, com barra fina. |
| A primeira passada de fidelidade deixou 5 diferenças. | Pergunta do candidato ("Ficou faltando algo do Figma?") e nova medição. | As 5 foram corrigidas. |
| A IA leu "abrange" onde o Figma diz "abrangente" e registrou no README um erro de digitação que não existia. | Leitura do texto do Figma em resolução cheia. | Item removido do README §12. |

## 9. Quinta etapa — acessibilidade

### Prompt

> "ótimo. Agora vamos pra outra etapa, pois mais que não esteja no Figma, mas a marca e qualidade SENAI, pelo
> fato de ser educação, deve ser preocupar com a acessibilidade de usuários que possuem limitações e tal.. então
> é importante pensarmos sobre isso e implementarmos, pois mais que não nos pediram, mas é um plus que vale
> fazermos. implemente o básico bem feito acessibilidade para diferentes tipos de usuários, dentre eles com
> problemas de visão, etc.. não se limite a apenas 1, implemente as melhores práticas"

### O que a IA fez

1. **Correções de WCAG 2.2 AA em problemas que já existiam:**
   - no celular, a barra fixa "Matricule-se" cobria o botão "Módulos" durante a navegação por `Tab`;
   - a borda dos campos de busca e filtro tinha contraste de 2,1:1 e 1,4:1 e passou para 3,4:1;
   - no modo de alto contraste do Windows, a barra de progresso do AVA sumia, a barra fixa ficava sem borda
     e os campos ficavam sem foco visível;
   - com texto ampliado, botões e rótulos vazavam a tela no celular;
   - a barra fixa às vezes não aparecia depois de recarregar a página.
2. **Menu "Acessibilidade"**, com as escolhas salvas no navegador e aplicadas antes da primeira pintura:
   - texto a 125% ou 150%;
   - alto contraste próprio, que também funciona com o modo do Windows e com o "aumentar contraste" do sistema;
   - espaçamento ampliado com os valores da WCAG;
   - links destacados;
   - animações reduzidas.
3. **Padrões brasileiros:** atalhos do eMAG (Alt+1 a Alt+4) e tradução para Libras pelo VLibras. O VLibras
   só carrega quando a pessoa ativa, e a página avisa que o texto é enviado ao serviço.
4. **Página `/acessibilidade`** e o que cada perfil recebe, no README §10.
5. **Revisão independente** por um subagente sem contexto da implementação: 8 problemas, todos corrigidos.

### O que foi aproveitado ou descartado

| Sugestão / tentativa | Decisão |
| -------------------- | ------- |
| Ícone de acessibilidade no cabeçalho, link no rodapé e VLibras | Mantidos como escolhas do candidato, fáceis de reverter (README §12, itens 18 a 20). |
| Alto contraste só trocando as variáveis de cor | Descartado: não cobre cores fixas nem fotos. O tema tem folha própria, com exceções por componente. |
| Carregar o VLibras sempre | Descartado: é um serviço externo e só carrega quando a pessoa ativa. |
| Painel carregado com `React.lazy` sem tratamento de erro | Ajustado: carrega no clique, com mensagem se falhar. |
| "Ouvir a aula" (leitura em voz alta no AVA) | Adiado: não é requisito da WCAG e precisa de vozes reais para testar. |

### Validação

- `npm run check` com 51 testes (13 novos) e build. O painel ficou num arquivo separado, de 3,9 KB
  compactado.
- Lighthouse: acessibilidade 100 em 5 páginas. Desempenho no celular no mesmo intervalo de antes (catálogo
  89–90, página inicial 92–95, curso 93).
- Nenhuma rolagem horizontal em 144 combinações: texto a 100%, 125% e 150%, espaçamento ampliado, de 320 a
  1920 px.
- 270 navegações com `Tab`, inclusive com texto a 150% no celular, sem foco escondido.
- Comparação de pixels do layout padrão: só mudaram o ícone, o link do rodapé e a borda da busca do AVA.

### Erros identificados nesta etapa e correções

| Problema | Como foi encontrado | Correção |
| -------- | ------------------- | -------- |
| Os atalhos "Ir para a busca" e "Ir para o rodapé" eram desfeitos pela restauração de rolagem do roteador, e o foco ficava fora da tela. | Revisão independente. | Os atalhos passaram a mover o foco e a rolagem por script. |
| O painel mostrava "Ativado" antes de o VLibras ficar pronto, e cliques seguidos geravam conflito. | Testes no navegador e revisão. | Estado de carregamento próprio e espera até o widget do VLibras estar disponível. |
| O foco do painel ficava branco e invisível (herdado do cabeçalho transparente), e o texto ficava com 14 px dentro do AVA. | Teste visual. | O painel passou a definir a própria cor de foco e o próprio tamanho de texto. |
| A IA usou `path` como nome de variável num script do zsh, o que apagou o PATH e derrubou as medições do Lighthouse. | Falha ao rodar as medições. | Variável renomeada. |
| A heurística da IA para detectar rótulos quebrados, pela altura mínima, dava resultado errado. | Revisão dos resultados. | Passou a contar as linhas reais do texto. |

## 10. Sexta etapa — segunda revisão (bugs)

### Prompt

> "revise de novo, dê uma segunda olhada mais cautelosa e veja se nada ficou errado ou com bug. Eu olhei aqui por
> alto, dentro do que você fez, tá bom, mas quero me assegurar que não tem nenhum bug"

### O que a IA fez

Revisou o código e testou de novo no navegador. Achou 14 problemas, alguns criados na etapa de acessibilidade
e outros mais antigos, e corrigiu todos. O README passou a descrever só o que foi realmente verificado, e
os `AGENTS.md` ganharam a regra de uma única restauração de rolagem, na raiz.

### O que foi aproveitado ou descartado

| Item | Decisão |
| ---- | ------- |
| Links longos do rodapé quebrando em duas linhas em colunas estreitas (320 e 1024 px) | Mantido: já era assim e não acontece na largura do Figma. |
| Título do curso encurtado ("Q…") na barra fixa a 320 px, em cursos "em breve" ou encerrados | Mantido: é o design original, e o título completo está no topo da página. |

### Validação

- `npm run check` com 53 testes, e build.
- **Teclado no painel:** Enter, Espaço, setas e `Esc`, com o foco voltando ao botão. 270 navegações com
  `Tab` sem foco escondido.
- **Falhas:** quando o painel não carrega, aparece uma mensagem clara.
- **VLibras:** ativar, desativar, reativar, sincronizar entre abas e recarregar com a escolha salva.
- **Rolagem horizontal:** nenhuma em 40 combinações a 100%, nem com todas as preferências ligadas. Agora
  inclui as 8 páginas de curso (72 combinações).
- **Layout de 1366 px:** idêntico pixel a pixel antes e depois das correções.

### Erros identificados nesta etapa e correções

| Problema | Como foi encontrado | Correção |
| -------- | ------------------- | -------- |
| O AVA abria rolado até o fim quando se clicava em "Matricule-se" na barra fixa (bug antigo). | Teste do fluxo curso → matrícula. | Uma única restauração de rolagem na raiz; a troca de aula não reinicia a rolagem. |
| Com texto a 150% no celular, a página do curso rolava na horizontal em cursos com rótulos longos. O teste anterior da IA cobria um curso só. | Teste das 8 páginas de curso. | Corrigido, com a verificação estendida aos 8 cursos. |
| O rótulo "Matricule-se" partia em "Matricule-" / "se" a 320 px. A própria IA causou isso ao permitir quebra de linha nos rótulos. | Teste a 320 px. | O botão mantém o rótulo inteiro, e quem encolhe é o título do curso. |
| O foco se perdia ao trocar entre o site e o AVA (bug antigo). | Teste com teclado. | Em navegações novas, o foco vai para o conteúdo ou para o título da aula. |
| Um único `Esc` fechava o painel e o menu do celular juntos. | Teste com teclado. | Cada `Esc` fecha uma camada. |
| O leitor de tela não anunciava "Restaurar padrões" na segunda vez, e arrastar uma seleção de texto para fora fechava o painel. | Revisão. | As duas coisas foram corrigidas. |

## 11. Sétima etapa — back-end (.NET + PostgreSQL)

### Prompt

> "ok, agora vamos fazer o back. Leia os doc e veja o que precise pra fazer e tal. Por enquanto só mapeie e me
> diga o que iremos precisar. Responda em pt br. Quero que você use boas práticas para back, principalmente
> segurança."

Depois do mapeamento:

> "pode fazer então. Vamos usar o gcloud e criar um novo projeto lá. Mas inicialmente, pode fazer na máquina
> local mesmo o banco, seguindo as boas práticas, de arquitetura a segurança e depois a gente sobe pro gcloud"

### O que a IA fez

1. **Mapeamento:**
   - leu o edital, o contrato do README §7 e o código do front que consome a API;
   - conferiu a máquina: sem o SDK do .NET, com o PostgreSQL 17 rodando;
   - pesquisou os planos gratuitos de hospedagem.
   
   Apontou que, no Render, a API gratuita "dorme" e levaria cerca de 1 minuto para acordar, mais do que
   o front espera (cerca de 31 s).
2. **SDK do .NET 10**, instalado com autorização. Antes de abrir o instalador oficial, a IA conferiu o hash
   SHA-512 contra a lista oficial da Microsoft e a assinatura notarizada pela Apple.
3. **Solução em Clean Architecture**, espelhando o front:
   - projetos Domain, Application, Infrastructure, Api e DbMigrator, mais testes unitários e de integração;
   - analisadores com avisos tratados como erro;
   - versões de pacotes centralizadas e travadas;
   - auditoria de vulnerabilidades.
4. **Banco:**
   - `setup.sql` cria um usuário dono e outro somente leitura, com sessões já em modo leitura e tempo
     máximo por consulta;
   - migrations do EF Core;
   - seed lido do mesmo `data/courses.seed.json` do front;
   - permissões concedidas pelo migrador. A API nunca escreve.
5. **Segurança da API:**
   - só GET;
   - validação dos parâmetros;
   - erros sem detalhes internos;
   - limite de requisições;
   - cabeçalhos de segurança e CORS restrito;
   - cache;
   - configuração validada na subida.
   
   Tudo está no README §3.
6. **Front:** o Vite passou a repassar `/api` para a API local.
7. **Revisão independente** por um subagente sem contexto da implementação: 8 problemas, todos corrigidos
   com testes.
8. **Documentação e Claude Code:**
   - README §2 a §8, §11 e §13;
   - `backend/AGENTS.md`;
   - hook de verificação cobrindo também o back-end;
   - permissões, incluindo o bloqueio de leitura dos segredos locais pelo agente.

### O que foi aproveitado ou descartado

| Sugestão / tentativa | Decisão |
| -------------------- | ------- |
| Hospedagem gratuita no Render | Descartada: a API levaria cerca de 1 minuto para acordar, e o front mostraria erro no primeiro acesso. |
| SQLite, sem serviço externo | Descartado: ficou o PostgreSQL. |
| Extensão `unaccent` do PostgreSQL para a busca sem acento | Descartada: colunas com o nome já normalizado, com a mesma regra do front. |
| Testcontainers (Docker) nos testes | Descartado: a máquina não tem Docker. Os testes criam e apagam um banco temporário no PostgreSQL local. |
| FluentAssertions, MediatR e AutoMapper | Evitados: passaram a ter licença comercial e não fazem falta. |
| Filtro com valor desconhecido devolvendo erro 400 | Descartado: devolve lista vazia, como o mock do front. |

### Validação

- **Back-end:** 107 testes. São 39 unitários e 68 de integração contra um PostgreSQL de verdade, num banco
  temporário apagado no fim. Cobrem:
  - contrato comparado com o seed;
  - comportamento da busca e dos filtros;
  - segurança: cabeçalhos, CORS, métodos, limites, injeção de SQL e erros sem detalhes;
  - permissões: escrever com o usuário da API é recusado pelo PostgreSQL.
- Casos de busca compartilhados (`data/search-cases.json`), testados no front e na API.
- Build sem avisos, `dotnet format --verify-no-changes` e nenhum pacote vulnerável, inclusive os transitivos.
- `npm run check` no front: 69 testes.
- Front ligado à API local no navegador: catálogo, filtros, detalhes, vazio, curso inexistente, erro e
  "Tentar novamente".
- Hook de verificação testado com um arquivo C# mal formatado de propósito: bloqueou o fim do turno.

### Erros identificados nesta etapa e correções

| Problema | Como foi encontrado | Correção |
| -------- | ------------------- | -------- |
| Quando o navegador cancelava uma requisição, outras iguais e simultâneas recebiam erro 500: o cache de saída fazia todas esperarem a primeira. | Log de rede do navegador e log da API. | Cache sem essa espera. O teste criado reproduz o bug: falhou 3 de 3 com ele e passou com a correção. |
| `featured=abc` devolvia 500 no ambiente de desenvolvimento. | Teste manual com `curl`. | Erro de conversão de parâmetro mapeado para 400. |
| O passo do README para ligar o front à API não funcionava no `npm run dev`, porque o `.env.development` vencia o `.env.local`. | Revisão independente. | O modo saiu do `.env.development`. |
| O caractere nulo (`%00`) em qualquer filtro gerava 500. | Revisão independente. | Passou a devolver lista vazia, como o mock, com teste. |
| O `setup.sql` não rodava sem superusuário, como nos serviços gerenciados, e, ao falhar, a senha podia ir para o log do servidor. | Revisão independente. | Script ajustado e testado sem superusuário; alerta e alternativa (`\password`) documentados. |
| A busca da API diferia do mock em caracteres raros, como acento solto e espaços incomuns. | Revisão independente. | Mesma regra nos dois lados, com casos de teste compartilhados. |
| Ao escrever sequências `\u` num arquivo C#, a IA gravou caracteres invisíveis (como U+2028). | `dotnet format`. | Trocados por sequências de escape, com varredura dos arquivos novos. |
| Um teste de CORS da IA esperava que o servidor recusasse o preflight de `DELETE`. | O próprio teste falhou. | Teste corrigido: o servidor anuncia só GET, e o navegador bloqueia o resto. |

## 12. Oitava etapa — publicação (Google Cloud + Neon)

### Prompt

> "sobre onde publicar. Pode ser na minha conta do Google. Como eu uso o Google, podemos subir lá, e como é algo
> pra teste, depois que eu for aprovado e tiver tudo ok eu derrubo. [...] Faz sentido? [...] por enquanto não
> faça nada, apenas isso"
>
> "vamos para o próximo passo. Pode publicar. Se precisar de mim pra algo, pode me dizer"

Ao longo da etapa: "pra que esse Neon? ele serve pra quê?" e, depois de a checagem de permissões do Claude
Code bloquear a publicação, "pode publicar".

### O que a IA fez

1. **Conferiu a conta do Google Cloud só lendo** e recomendou um projeto novo, separado dos que já existiam.
2. **Criou o projeto `sesi-catalogo-cursos` no Google Cloud**, com:
   - faturamento ligado e só as APIs necessárias;
   - alerta de orçamento de R$ 5;
   - repositório de imagens com limpeza automática;
   - uma conta de serviço exclusiva para a API.
3. **Imagem da API** (`backend/Dockerfile`), construída no Cloud Build:
   - SDK fixo e restauração travada;
   - imagem "chiseled" com ICU, que a busca usa;
   - usuário sem privilégios.
4. **Banco no Neon** (plano gratuito, São Paulo):
   - o candidato criou a conta e o projeto, e a IA conferiu a região e a configuração;
   - a connection string do administrador foi copiada pelo candidato e salva num arquivo protegido, sem
     passar pelo chat;
   - a IA rodou o `setup.sql` e o migrador;
   - as credenciais foram para o Secret Manager, e a cópia local foi apagada.
5. **API no Cloud Run** (São Paulo):
   - no máximo 2 instâncias;
   - connection string lida do Secret Manager;
   - identidade com acesso só ao próprio segredo.
   
   O primeiro comando foi bloqueado pela checagem de permissões do Claude Code, por deixar a API pública.
   A IA parou e só publicou depois da confirmação explícita do candidato.
6. **Site no Firebase Hosting:**
   - `/api` é repassado ao Cloud Run, no mesmo domínio;
   - cabeçalhos de segurança;
   - CSP com hash dos scripts inline, e um verificador que faz o build falhar se o hash não bater;
   - cache por tipo de arquivo.
7. **README §11** (como está configurado, como publicar de novo e como derrubar) e **§13**.

### O que foi aproveitado ou descartado

| Sugestão / tentativa | Decisão |
| -------------------- | ------- |
| Render para a API | Trocado pelo Google Cloud, escolha do candidato. O Cloud Run acorda em segundos. |
| Cloud SQL, o banco do próprio Google | Descartado: não tem plano gratuito. |
| Reaproveitar um projeto que já existia na conta | Descartado: projeto novo, isolado e fácil de apagar depois. |
| Passos do onboarding do Neon (`neon init`/`neon deploy`) | Não seguidos: gravariam a senha do banco no `.env.local` do front e ligariam o React direto ao banco. Aqui só a API acessa o banco, com um usuário que só lê. |
| Confiar em mais de um proxy no `X-Forwarded-For` para ler o IP real do usuário | Descartado: permitiria IP forjado. O limite por IP vale por IP de saída do Firebase (README §13). |
| Telemetria do VLibras (PostHog) | Bloqueada pela CSP de propósito. O tradutor funciona sem ela. |

### Validação

- **API pela URL pública:**
  - respostas 200, 404, 405 e 400 corretas;
  - busca com acento, o que prova o ICU na imagem;
  - cabeçalhos de segurança, inclusive o HSTS.
- **Pelo domínio do site:** `/api` responde, e a segunda chamada já vem do cache do Firebase (`x-cache: HIT`).
- **No navegador, no domínio real:**
  - página inicial, catálogo com busca e filtros, detalhes, AVA, vazio e curso inexistente;
  - VLibras com o avatar;
  - nenhum bloqueio da CSP no console, além da telemetria do VLibras.
- **Logs do Cloud Run:** sem erros 5xx e sem erros da aplicação.
- **Tempo de resposta:** a primeira consulta depois de um tempo parado levou 2,3 s; as seguintes, de 0,1 a
  0,5 s.

### Erros identificados nesta etapa e correções

| Problema | Como foi encontrado | Correção |
| -------- | ------------------- | -------- |
| O `setup.sql` falhou no Neon. No PostgreSQL 16+, quem cria um papel já vira membro dele, mas sem poder assumi-lo. A condição que a IA tinha acrescentado conferia só a filiação, e ela não testou de novo depois de mudar. | Erro ao rodar no Neon. | A checagem passou a ser a permissão de assumir o papel. Testado duas vezes localmente sem superusuário, e depois no Neon. |
| `/api` pelo site devolvia 400: o Firebase chama a API por um endereço alternativo (`…a.run.app`), que não estava na lista de hosts permitidos. | Teste com `curl` depois da publicação. | Endereço incluído na lista; os logs confirmaram o host usado. |
| A IA clicou em "copiar" no console do Neon pelo navegador. Com a janela em segundo plano, a página não conseguiu gravar na área de transferência, e o arquivo recebeu o texto que já estava lá. | Checagem do formato do arquivo antes do uso, sem exibir o conteúdo. | Arquivo apagado; o candidato copiou com o próprio clique. |

## 13. Responsabilidade

A IA acelerou a produção, mas as decisões (escopo, tecnologias, prioridades e o que aceitar ou descartar)
foram do candidato, que é responsável pelo resultado entregue. Todo o código gerado foi submetido às
verificações descritas na seção 4.
