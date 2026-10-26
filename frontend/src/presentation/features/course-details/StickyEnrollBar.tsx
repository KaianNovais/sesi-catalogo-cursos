import type { Course } from '@/domain/course/Course';
import { cx } from '@/shared/utils/cx';
import { EnrollAction } from './EnrollAction';
import styles from './CourseDetails.module.css';

interface StickyEnrollBarProps {
  course: Course;
  visible: boolean;
}

/** Barra fixa do Figma: mantém a matrícula acessível enquanto o usuário lê os detalhes. */
export function StickyEnrollBar({ course, visible }: StickyEnrollBarProps) {
  return (
    <aside
      aria-label="Matrícula"
      className={cx(styles.stickyBar, visible && styles.stickyBarVisible)}
      // Quando oculta, sai da ordem de tabulação e da árvore de acessibilidade.
      inert={!visible}
    >
      <div className={cx('container', styles.stickyInner)}>
        <p className={styles.stickyTitle}>
          <span className={styles.stickyFullName}>{course.fullName}</span>
          <span className={styles.stickyShortName}>{course.shortName}</span>
        </p>
        {/* No Figma o botão da barra tem 44px (barra de 76px) */}
        <EnrollAction course={course} variant="light" size="lg" className={styles.stickyAction} />
      </div>
    </aside>
  );
}
