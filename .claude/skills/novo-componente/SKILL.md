---
name: novo-componente
description: Cria ou estende um componente React reutilizável do front-end seguindo os padrões do projeto (reuso antes de criar, CSS Module com tokens, acessibilidade, teste). Use ao criar componente, extrair UI repetida ou adicionar variante.
argument-hint: "[NomeDoComponente] [o que ele deve fazer]"
---

Pedido: $ARGUMENTS

1. **Reuso primeiro.** Liste `frontend/src/presentation/components/` e procure (Grep) markup ou classes
   parecidas em `features/` e `layouts/`. Se um componente existente resolve a maior parte, estenda-o
   com uma prop ou variante e pule para o passo 6.
2. **Lugar.** Usado (ou prestes a ser usado) por duas ou mais features → `components/<Nome>/`; por uma
   só → `features/<feature>/`.
3. **Arquivos.** `<Nome>.tsx` com export nomeado, `interface <Nome>Props`, `className?` mesclado com `cx`
   (`@/shared/utils/cx`) e `ref` como prop, se precisar. `<Nome>.module.css` com tokens e container
   query se o layout mudar com a largura.
4. **Acessibilidade.** Elemento nativo antes de ARIA (`button`, `a`, `ul`...), nome acessível, estados
   (`aria-expanded`, `aria-current`, `aria-busy`) quando houver e operação completa pelo teclado.
5. **Teste.** Se houver comportamento (interação, estado, regra), crie `<Nome>.test.tsx` com consultas
   por papel ou rótulo.
6. **Elimine as duplicações** achadas no passo 1, trocando-as pelo componente.
7. Rode `npm run check` em `frontend/` e mostre o resultado. Se a lista de componentes mudou, atualize
   `frontend/src/presentation/AGENTS.md`.
