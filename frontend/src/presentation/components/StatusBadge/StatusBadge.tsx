import type { CourseStatus } from '@/domain/course/Course';
import { cx } from '@/shared/utils/cx';
import styles from './StatusBadge.module.css';

interface StatusBadgeProps {
  status: CourseStatus;
  className?: string;
}

/** O status é comunicado por texto; a cor do marcador é apenas reforço visual. */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={cx(styles.badge, styles[status.code], className)}>
      <span className={styles.dot} aria-hidden="true" />
      {status.name}
    </span>
  );
}
