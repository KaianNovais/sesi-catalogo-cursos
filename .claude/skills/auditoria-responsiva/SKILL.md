---
name: auditoria-responsiva
description: Audita a responsividade do front-end no navegador — overflow horizontal e quebras de layout de 320 a 1920 px e com o celular deitado. Use depois de mudar layout ou CSS, ou quando alguém disser que a tela "não está responsiva".
argument-hint: "[rota opcional, ex.: /cursos]"
---

Precisa de uma ferramenta de navegador (o navegador embutido do app desktop ou o Claude in Chrome).
Sem ela, diga isso e pare.

1. Garanta o front rodando: se <http://localhost:5173> não responder, inicie-o. No app desktop, use a
   configuração `sesi-frontend` do `.claude/launch.json`; nos outros ambientes, `npm run dev` em
   `frontend/` em segundo plano.
2. Rotas: $ARGUMENTS. Se nenhuma foi informada: `/`, `/cursos`, `/cursos?busca=xyz` (estado vazio),
   `/cursos/matematica-para-a-precisao` e `/area-do-aluno/matematica-para-a-precisao`.
3. Para cada viewport — 320×640, 360×740, 390×844, 768×1024, 1024×768, 1366×768, 1920×1080 e
   844×390 (celular deitado) — e cada rota:
   - redimensione a aba, navegue e espere o conteúdo final (sem skeleton);
   - execute o conteúdo de [scripts/overflow-check.js](scripts/overflow-check.js) na página (ferramenta
     de JavaScript do navegador) e guarde o retorno;
   - até 768 px, abra também o menu e o painel de filtros do catálogo e repita a checagem.
4. Tire screenshot só onde houver suspeita e confira: texto cortado, sobreposição, alvo de toque menor
   que 24 px, conteúdo escondido atrás do cabeçalho fixo.
5. Ao terminar, devolva a aba ao tamanho normal.
6. Relate uma tabela rota × viewport (✅ ou ❌ com o elemento culpado) e, para cada ❌, a causa provável
   (arquivo CSS e seletor). Não corrija sem o autor pedir.
