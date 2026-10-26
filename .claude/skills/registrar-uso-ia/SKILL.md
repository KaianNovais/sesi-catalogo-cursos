---
name: registrar-uso-ia
description: Registra uma etapa do desenvolvimento feita com IA no USO_DE_IA.md, na estrutura exigida pelo edital (ferramenta, objetivo, prompts aproveitados e descartados, validação, erro identificado e correção). Use ao fim de cada etapa.
argument-hint: "[nome da etapa]"
disable-model-invocation: true
---

Etapa: $ARGUMENTS

1. Leia o `USO_DE_IA.md` inteiro para seguir a numeração e o formato das etapas anteriores.
2. Reúna os fatos desta etapa a partir da conversa e dos arquivos alterados: o pedido do autor (cite as
   palavras dele, sem reescrever), o que a IA fez, o que foi aproveitado, o que foi descartado ou
   ajustado e por quê, como foi validado (comandos e resultados reais) e pelo menos um erro ou
   inadequação real da IA, com a correção feita.
3. Escreva a nova seção antes de "Responsabilidade" e renumere as seguintes. Subseções: Prompt · O que a
   IA fez · O que foi aproveitado ou descartado · Validação · Erros identificados e correções.
4. Nunca invente prompt, número, resultado ou erro. Se faltar informação, deixe
   `<!-- PREENCHER: ... -->` e pergunte ao autor.
5. Termine lembrando o autor de revisar e reescrever o texto com as próprias palavras: o registro é dele.
