/**
 * Erros conhecidos da aplicação. A infraestrutura traduz falhas técnicas
 * (HTTP, rede, timeout) para estes tipos; a interface decide o que exibir.
 */
export class AppError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = new.target.name;
  }
}

/** O recurso solicitado não existe (ex.: curso com slug inválido). */
export class NotFoundError extends AppError {}

/** Serviço indisponível: falha de rede, timeout ou erro 5xx da API. */
export class ServiceUnavailableError extends AppError {}
