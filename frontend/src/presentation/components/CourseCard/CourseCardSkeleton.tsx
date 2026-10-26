import { Skeleton } from '../Skeleton/Skeleton';
import styles from './CourseCard.module.css';

/** Placeholder com as mesmas dimensões do CourseCard (evita "pulos" de layout). */
export function CourseCardSkeleton() {
  return (
    <div className={styles.card} aria-hidden="true">
      <div className={styles.top}>
        <Skeleton tone="dark" width="7rem" height="1.75rem" />
      </div>
      <div className={styles.body}>
        <Skeleton tone="dark" height="1.5rem" />
        <Skeleton tone="dark" width="70%" height="1.5rem" />
        <Skeleton tone="dark" height="1rem" />
        <Skeleton tone="dark" width="85%" height="1rem" />
      </div>
    </div>
  );
}
