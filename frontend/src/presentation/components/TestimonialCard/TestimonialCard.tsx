import { cx } from '@/shared/utils/cx';
import { Icon } from '../Icon/Icon';
import styles from './TestimonialCard.module.css';

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  rating: number;
}

interface TestimonialCardProps {
  testimonial: Testimonial;
  /** "brand": card vermelho (página inicial); "light": card branco (página do curso). */
  tone?: 'brand' | 'light';
}

const MAX_RATING = 5;

export function TestimonialCard({ testimonial, tone = 'brand' }: TestimonialCardProps) {
  const { quote, author, role, rating } = testimonial;

  return (
    <figure className={cx(styles.card, styles[tone])}>
      <blockquote className={styles.quote}>
        <p>“{quote}”</p>
      </blockquote>
      <figcaption className={styles.footer}>
        <span className={styles.author}>{author}</span>
        <span className={styles.role}>{role}</span>
        <span
          className={styles.rating}
          role="img"
          aria-label={`Avaliação: ${rating} de ${MAX_RATING}`}
        >
          {Array.from({ length: MAX_RATING }, (_, index) => (
            <Icon
              key={index}
              name="star"
              size={20}
              className={index < rating ? undefined : styles.starEmpty}
            />
          ))}
        </span>
      </figcaption>
    </figure>
  );
}
