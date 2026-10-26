import type { CourseSummary } from '@/domain/course/Course';
import { formatDate } from '@/shared/utils/date';

/**
 * Rótulo da data de disponibilização conforme o status do curso
 * ("quando aplicável", como pede o enunciado). Retorna null se não houver o que exibir.
 */
export function getAvailabilityText(
  course: Pick<CourseSummary, 'status' | 'availableFrom'>,
): { label: string; value: string } | null {
  const date = course.availableFrom ? formatDate(course.availableFrom) : '';

  switch (course.status.code) {
    case 'inscricoes-abertas':
      return date
        ? { label: 'Início do curso', value: date }
        : { label: 'Início', value: 'Imediato' };
    case 'em-breve':
      return { label: 'Disponível a partir de', value: date || 'Data a definir' };
    case 'encerrado':
      return date ? { label: 'Última turma iniciada em', value: date } : null;
  }
}

/** Texto do botão de matrícula quando a matrícula não está disponível. */
export function getUnavailableEnrollmentLabel(course: Pick<CourseSummary, 'status'>): string {
  return course.status.code === 'em-breve' ? 'Inscrições em breve' : 'Inscrições encerradas';
}
