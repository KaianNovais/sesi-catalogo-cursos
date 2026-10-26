# Camada de domínio

TypeScript puro: tipos (`course/Course.ts`), regras (`course/courseRules.ts`, `course/courseFilters.ts`),
a porta `course/CourseRepository.ts` e os erros (`errors.ts`).

- Não importe React, TanStack Query, React Router, `fetch`, `import.meta.env` nem outras camadas
  (`@/application`, `@/infrastructure`, `@/presentation`, `@/app`).
- Regra de negócio nova nasce aqui, com teste unitário ao lado (`*.test.ts`), nunca dentro de componente.
- Erros conhecidos estendem `AppError` (`NotFoundError`, `ServiceUnavailableError`); quem decide a
  mensagem exibida é a interface.
- Mudou a porta `CourseRepository`? Ajuste os dois adaptadores (`httpCourseRepository` e
  `inMemoryCourseRepository`) na mesma tarefa.
- Filtros são opcionais e combináveis; `normalizeFilters` remove valores vazios para que consultas
  equivalentes gerem a mesma chave de cache e a mesma URL.
