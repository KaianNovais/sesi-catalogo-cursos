---
name: auditoria-lighthouse
description: Mede desempenho, acessibilidade, boas práticas e SEO com o Lighthouse (mobile e desktop) no build de produção e compara com o orçamento do projeto. Use antes de uma entrega ou depois de mudanças visuais grandes.
disable-model-invocation: true
---

1. Em `frontend/`: `npm run build` e depois o servidor do build na porta 4173. No app desktop, use a
   configuração `sesi-frontend-preview` do `.claude/launch.json`; nos outros ambientes, `npm run preview`
   em segundo plano.
2. Rode `node "${CLAUDE_SKILL_DIR}/scripts/lighthouse.mjs"`. O padrão é <http://localhost:4173>, com home,
   catálogo e detalhes em mobile e desktop. Na primeira vez o `npx` baixa o Lighthouse 13.5.0; é preciso
   ter o Google Chrome instalado (ou a variável `CHROME_PATH`). Leva alguns minutos.
3. Compare com o orçamento (README §9): no mobile, desempenho ≥ 90; acessibilidade, boas práticas e
   SEO = 100; CLS = 0. Para cada nota fora do orçamento, use as auditorias reprovadas que o script
   lista para apontar a causa provável no código.
4. Encerre o `preview`.
5. Mostre a tabela de notas. Se os números mudaram, proponha atualizar a tabela do README §9 — não
   edite sem confirmação.
