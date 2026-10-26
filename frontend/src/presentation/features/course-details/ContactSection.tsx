import type { Ref } from 'react';
import type { Course } from '@/domain/course/Course';
import { cx } from '@/shared/utils/cx';
import { ButtonLink } from '../../components/Button/Button';
import { SectionHeading } from '../../components/SectionHeading/SectionHeading';
import { site } from '../../content/site';
import styles from './CourseDetails.module.css';

interface ContactSectionProps {
  course: Pick<Course, 'shortName'>;
  /** React 19: ref é uma prop comum (dispensa forwardRef). */
  ref?: Ref<HTMLElement>;
}

export function ContactSection({ course, ref }: ContactSectionProps) {
  const subject = encodeURIComponent(`Dúvida sobre o curso ${course.shortName}`);

  return (
    <section ref={ref} className={styles.contact} aria-labelledby="fale-conosco">
      <div className={cx('container', styles.contactContent)}>
        <SectionHeading
          id="fale-conosco"
          eyebrow="Precisa de ajuda para decidir?"
          title="Fale com a gente"
          align="center"
        />
        <ButtonLink
          to={`mailto:${site.email}?subject=${subject}`}
          variant="light"
          endIcon="arrowRight"
        >
          Mandar uma mensagem
        </ButtonLink>
      </div>
    </section>
  );
}
