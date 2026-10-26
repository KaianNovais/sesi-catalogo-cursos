import { cx } from '@/shared/utils/cx';
import { Skeleton } from '../../components/Skeleton/Skeleton';
import styles from './CourseDetails.module.css';

export function CourseDetailsSkeleton() {
  return (
    // Ocupa a altura da tela: sem isso o rodapé apareceria e seria empurrado ao carregar (CLS).
    <section className={cx(styles.hero, styles.loadingPage)} aria-busy="true">
      <p role="status" className="visually-hidden">
        Carregando detalhes do curso…
      </p>
      <div className={cx('container', styles.heroGrid)} aria-hidden="true">
        <div className={styles.heroText}>
          <Skeleton width="8rem" height="1.75rem" />
          <Skeleton height="2.5rem" />
          <Skeleton width="75%" height="2.5rem" />
          <Skeleton width="60%" height="1.25rem" />
          <Skeleton width="50%" height="1.25rem" />
          <Skeleton width="9rem" height="2.5rem" radius="var(--radius-md)" />
        </div>
        <Skeleton height="auto" radius="var(--radius-lg)" className={styles.heroMediaSkeleton} />
      </div>
    </section>
  );
}
