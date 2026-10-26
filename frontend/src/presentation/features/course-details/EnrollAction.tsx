import type { CourseSummary } from '@/domain/course/Course';
import { canEnroll } from '@/domain/course/courseRules';
import {
  Button,
  ButtonLink,
  type ButtonSize,
  type ButtonVariant,
} from '../../components/Button/Button';
import { learningPath } from '../../routes/paths';
import { preloadOnIntent } from '../../routes/routeModules';
import { getUnavailableEnrollmentLabel } from './courseText';

interface EnrollActionProps {
  course: Pick<CourseSummary, 'slug' | 'status'>;
  variant: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

/**
 * Botão de matrícula. Aplica a regra de negócio do domínio: com inscrições
 * abertas leva ao AVA (matrícula simulada); caso contrário fica indisponível,
 * mas continua perceptível para leitores de tela (aria-disabled em vez de disabled).
 */
export function EnrollAction({ course, variant, size, className }: EnrollActionProps) {
  if (canEnroll(course)) {
    return (
      <ButtonLink
        to={learningPath(course.slug)}
        variant={variant}
        size={size}
        endIcon="arrowRight"
        className={className}
        {...preloadOnIntent('learning')}
      >
        Matricule-se
      </ButtonLink>
    );
  }

  return (
    <Button variant={variant} size={size} aria-disabled="true" className={className}>
      {getUnavailableEnrollmentLabel(course)}
    </Button>
  );
}
