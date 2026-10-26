import { Link } from 'react-router';
import type { CourseSummary } from '@/domain/course/Course';
import { usePrefetchCourse } from '../../queries/courseQueries';
import { coursePath } from '../../routes/paths';
import { getCourseImageSrcSet } from '../../utils/courseImage';
import { StatusBadge } from '../StatusBadge/StatusBadge';
import { CategoryTag } from '../Tag/Tag';
import styles from './CourseCard.module.css';

interface CourseCardProps {
  course: CourseSummary;
  headingLevel?: 'h2' | 'h3';
  /** Exibe status, modalidade e carga horária (usado no catálogo). */
  showDetails?: boolean;
  /**
   * Foto que deve ser o maior elemento da tela (LCP): sem lazy loading e com prioridade
   * alta desde o início do download. As demais usam lazy loading (as que já estão na
   * tela são baixadas logo após o layout; as outras, quando o usuário se aproxima).
   */
  priority?: boolean;
}

/**
 * Card de curso do Figma. O link do título cobre o card inteiro (área de
 * clique maior), mantendo um único elemento focável por card.
 */
export function CourseCard({
  course,
  headingLevel: Heading = 'h3',
  showDetails = false,
  priority = false,
}: CourseCardProps) {
  const prefetchCourse = usePrefetchCourse();
  const prefetch = () => prefetchCourse(course.slug);

  return (
    <article className={styles.card}>
      <img
        className={styles.image}
        src={course.imageUrl}
        srcSet={getCourseImageSrcSet(course.imageUrl)}
        // A foto cobre o card em "cover": a altura (396px) define a largura exibida (~600px)
        sizes="600px"
        alt=""
        width={1200}
        height={800}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        decoding="async"
      />

      <div className={styles.top}>
        <CategoryTag category={course.category} />
        {showDetails ? <StatusBadge status={course.status} /> : null}
      </div>

      <div className={styles.body}>
        <Heading className={styles.title}>
          <Link
            to={coursePath(course.slug)}
            className={styles.link}
            onPointerEnter={prefetch}
            onFocus={prefetch}
          >
            {course.fullName}
          </Link>
        </Heading>
        <p className={styles.summary}>{course.summary}</p>
        {showDetails ? (
          <p className={styles.details}>
            <span>{course.modality.name}</span>
            <span aria-hidden="true">•</span>
            <span>{course.workloadHours} horas</span>
          </p>
        ) : null}
      </div>
    </article>
  );
}
