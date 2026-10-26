import type { CourseRepository } from '@/domain/course/CourseRepository';

/**
 * Dependências que a interface consome. A composição concreta (qual
 * repositório usar) acontece na raiz da aplicação (src/app).
 */
export interface Dependencies {
  courseRepository: CourseRepository;
}
