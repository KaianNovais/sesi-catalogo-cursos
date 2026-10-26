import type { RefObject } from 'react';
import type { Course } from '@/domain/course/Course';
import { cx } from '@/shared/utils/cx';
import { Icon, type IconName } from '../../components/Icon/Icon';
import { MediaFrame } from '../../components/MediaFrame/MediaFrame';
import { StatusBadge } from '../../components/StatusBadge/StatusBadge';
import { CategoryTag } from '../../components/Tag/Tag';
import { getCourseImageSrcSet } from '../../utils/courseImage';
import { getAvailabilityText } from './courseText';
import { EnrollAction } from './EnrollAction';
import styles from './CourseDetails.module.css';

interface CourseHeroProps {
  course: Course;
  /** Referência do botão principal: a barra fixa aparece quando ele sai da tela. */
  actionRef: RefObject<HTMLDivElement | null>;
}

function MetaItem({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <div className={styles.metaItem}>
      <Icon name={icon} size={20} className={styles.metaIcon} />
      <dt>{label}:</dt>
      <dd>{value}</dd>
    </div>
  );
}

export function CourseHero({ course, actionRef }: CourseHeroProps) {
  const availability = getAvailabilityText(course);

  return (
    <section className={styles.hero} aria-labelledby="curso-titulo">
      <div className={cx('container', styles.heroGrid)}>
        <div className={styles.heroText}>
          <div className={styles.badges}>
            <CategoryTag category={course.category} />
            <StatusBadge status={course.status} />
          </div>
          <h1 id="curso-titulo" className={styles.title}>
            {course.fullName}
          </h1>
          <dl className={styles.meta}>
            {availability ? (
              <MetaItem icon="calendar" label={availability.label} value={availability.value} />
            ) : null}
            <MetaItem icon="devices" label="Modalidade" value={course.modality.name} />
            <MetaItem
              icon="schedule"
              label="Carga horária"
              value={`${course.workloadHours} horas`}
            />
            <MetaItem icon="certificate" label="Certificação" value={course.certification} />
          </dl>
          <div ref={actionRef} className={styles.heroAction}>
            <EnrollAction course={course} variant="dark" />
          </div>
        </div>
        <MediaFrame
          src={course.imageUrl}
          srcSet={getCourseImageSrcSet(course.imageUrl)}
          sizes="(min-width: 64rem) 664px, 100vw"
          alt=""
          priority
          className={styles.heroMedia}
        />
      </div>
    </section>
  );
}
