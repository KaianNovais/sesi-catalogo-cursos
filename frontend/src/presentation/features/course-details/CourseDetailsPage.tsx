import { useRef, type CSSProperties } from 'react';
import { useParams } from 'react-router';
import type { Course } from '@/domain/course/Course';
import { NotFoundError } from '@/domain/errors';
import { cx } from '@/shared/utils/cx';
import { Button, ButtonLink } from '../../components/Button/Button';
import { FeatureList } from '../../components/FeatureList/FeatureList';
import { StateMessage } from '../../components/StateMessage/StateMessage';
import { TestimonialsSection } from '../../components/TestimonialsSection/TestimonialsSection';
import { courseFeatures } from '../../content/course';
import { testimonials } from '../../content/home';
import { useViewportPosition } from '../../hooks/useViewportPosition';
import { useCourseDetails } from '../../queries/courseQueries';
import { paths } from '../../routes/paths';
import { ContactSection } from './ContactSection';
import { CourseAbout } from './CourseAbout';
import { CourseDetailsSkeleton } from './CourseDetailsSkeleton';
import { CourseHero } from './CourseHero';
import { StickyEnrollBar } from './StickyEnrollBar';
import styles from './CourseDetails.module.css';

function CourseDetails({ course }: { course: Course }) {
  const heroActionRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLElement>(null);
  const heroActionPosition = useViewportPosition(heroActionRef, 'visible');
  const contactPosition = useViewportPosition(contactRef, 'before');
  // A barra aparece depois do botão principal e some ao chegar no "Fale com a gente".
  const showStickyBar = heroActionPosition === 'after' && contactPosition === 'before';

  return (
    // A cor da categoria tematiza a página inteira, como no Figma.
    <div style={{ '--accent': course.category.color } as CSSProperties}>
      <title>{`${course.fullName} | SESI Indústria`}</title>
      <meta name="description" content={course.summary} />

      <CourseHero course={course} actionRef={heroActionRef} />
      <section className={styles.features} aria-labelledby="diferenciais-curso">
        <div className="container">
          <h2 id="diferenciais-curso" className="visually-hidden">
            Diferenciais do curso
          </h2>
          <FeatureList features={courseFeatures} tone="accent" />
        </div>
      </section>
      <CourseAbout course={course} />
      <TestimonialsSection testimonials={testimonials} tone="accent" />
      <ContactSection ref={contactRef} course={course} />
      <StickyEnrollBar course={course} visible={showStickyBar} />
    </div>
  );
}

export function CourseDetailsPage() {
  const { slug = '' } = useParams();
  const { data: course, isPending, isError, error, refetch, isFetching } = useCourseDetails(slug);

  if (isPending) return <CourseDetailsSkeleton />;

  if (isError) {
    const notFound = error instanceof NotFoundError;
    return (
      <div className={cx('container', styles.statePage)}>
        <title>
          {notFound ? 'Curso não encontrado | SESI Indústria' : 'Erro | SESI Indústria'}
        </title>
        {notFound ? (
          <StateMessage
            headingLevel="h1"
            icon="searchOff"
            title="Curso não encontrado"
            description="O curso que você procura não existe ou não está mais disponível no catálogo."
            action={
              <ButtonLink to={paths.catalog} variant="dark" endIcon="arrowRight">
                Ver todos os cursos
              </ButtonLink>
            }
          />
        ) : (
          <StateMessage
            role="alert"
            headingLevel="h1"
            icon="error"
            title="Não foi possível carregar o curso"
            description="O serviço de cursos não respondeu. Verifique sua conexão e tente novamente."
            action={
              <Button
                variant="dark"
                startIcon="refresh"
                disabled={isFetching}
                onClick={() => refetch()}
              >
                Tentar novamente
              </Button>
            }
          />
        )}
      </div>
    );
  }

  return <CourseDetails key={course.slug} course={course} />;
}
