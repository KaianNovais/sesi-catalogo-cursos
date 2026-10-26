import type { CourseModule, CourseSummary } from './Course';

/** Regra de negócio: só é possível se matricular em cursos com inscrições abertas. */
export function canEnroll(course: Pick<CourseSummary, 'status'>): boolean {
  return course.status.code === 'inscricoes-abertas';
}

/** Total de aulas do curso (soma das aulas de todos os módulos). */
export function countLessons(modules: CourseModule[]): number {
  return modules.reduce((total, module) => total + module.lessons.length, 0);
}
