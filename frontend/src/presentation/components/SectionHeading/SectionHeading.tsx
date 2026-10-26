import type { ReactNode } from 'react';
import { cx } from '@/shared/utils/cx';
import styles from './SectionHeading.module.css';

interface SectionHeadingProps {
  title: ReactNode;
  /** Texto de apoio acima do título (ex.: "DEPOIMENTOS"). */
  eyebrow?: string;
  as?: 'h1' | 'h2';
  id?: string;
  align?: 'start' | 'center';
  className?: string;
}

/** Título de seção no padrão do Figma (Open Sans Bold 40px). Herda a cor da seção. */
export function SectionHeading({
  title,
  eyebrow,
  as: Heading = 'h2',
  id,
  align = 'start',
  className,
}: SectionHeadingProps) {
  return (
    <div className={cx(styles.heading, styles[align], className)}>
      {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
      <Heading id={id} className={styles.title}>
        {title}
      </Heading>
    </div>
  );
}
