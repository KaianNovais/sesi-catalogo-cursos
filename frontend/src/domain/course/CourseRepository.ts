import type { Category, Course, CourseList, CourseStatus, Modality } from './Course';
import type { CourseFilters } from './courseFilters';

export interface RequestOptions {
  /** Permite cancelar a requisição (ex.: o usuário mudou o filtro antes da resposta). */
  signal?: AbortSignal;
}

/**
 * Porta de saída (Clean Architecture): o domínio define o contrato e a
 * infraestrutura fornece as implementações (API HTTP ou repositório em memória).
 */
export interface CourseRepository {
  list(filters: CourseFilters, options?: RequestOptions): Promise<CourseList>;
  /** @throws NotFoundError quando o curso não existe. */
  getBySlug(slug: string, options?: RequestOptions): Promise<Course>;
  listCategories(options?: RequestOptions): Promise<Category[]>;
  listModalities(options?: RequestOptions): Promise<Modality[]>;
  listStatuses(options?: RequestOptions): Promise<CourseStatus[]>;
}
