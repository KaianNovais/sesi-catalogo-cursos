import { cx } from '@/shared/utils/cx';
import { Carousel } from '../Carousel/Carousel';
import { SectionHeading } from '../SectionHeading/SectionHeading';
import { TestimonialCard, type Testimonial } from '../TestimonialCard/TestimonialCard';
import styles from './TestimonialsSection.module.css';

interface TestimonialsSectionProps {
  testimonials: readonly Testimonial[];
  /** "brand": vermelho (página inicial); "accent": cor da categoria (página do curso). */
  tone?: 'brand' | 'accent';
}

const getKey = (testimonial: Testimonial) => testimonial.id;

export function TestimonialsSection({ testimonials, tone = 'brand' }: TestimonialsSectionProps) {
  const cardTone = tone === 'brand' ? 'brand' : 'light';

  return (
    <section className={cx(styles.section, styles[tone])} aria-labelledby="depoimentos-titulo">
      <div className="container">
        <SectionHeading id="depoimentos-titulo" eyebrow="Depoimentos" title="Quem fez recomenda" />
      </div>
      <Carousel
        label="Depoimentos de alunos"
        items={testimonials}
        getKey={getKey}
        renderItem={(testimonial) => <TestimonialCard testimonial={testimonial} tone={cardTone} />}
        tone={tone === 'brand' ? 'light' : 'dark'}
        className={styles.carousel}
      />
    </section>
  );
}
