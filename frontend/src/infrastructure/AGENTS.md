# Camada de infraestrutura (adaptadores)

- `course/courseDtos.ts` espelha o JSON da API (README §7). Mudou o contrato? Atualize na mesma tarefa:
  DTOs, `courseMappers.ts`, `httpCourseRepository.ts`, `inMemoryCourseRepository.ts` e o README (§7 e §8).
- O mock em memória é o contrato executável que a API .NET (`backend/`) reproduz: busca no nome completo
  e no nome breve sem diferenciar acentos nem maiúsculas, filtros combináveis e os mesmos erros.
  Mantenha os dois comportamentos iguais (no back-end, os `ContractTests` comparam a API com o seed).
- `http/httpClient.ts` traduz falhas em erros de domínio: 404 → `NotFoundError`; rede, timeout, demais
  status de erro e JSON inválido → `ServiceUnavailableError`. Cancelamento pedido pelo chamador
  propaga sem conversão.
- Variáveis de ambiente são lidas só em `config/env.ts`.
- Componentes nunca recebem DTOs: os mapeadores convertem tudo para as entidades do domínio.
