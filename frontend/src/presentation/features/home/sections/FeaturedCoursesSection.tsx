import type { CourseSummary } from '@/domain/course/Course';
import { Button, ButtonLink } from '../../../components/Button/Button';
import { Carousel } from '../../../components/Carousel/Carousel';
import { AllCoursesCard } from '../../../components/CourseCard/AllCoursesCard';
import { CourseCard } from '../../../components/CourseCard/CourseCard';
import { CourseCardSkeleton } from '../../../components/CourseCard/CourseCardSkeleton';
import { SectionHeading } from '../../../components/SectionHeading/SectionHeading';
import { StateMessage } from '../../../components/StateMessage/StateMessage';
import { useCourseList } from '../../../queries/courseQueries';
import { paths } from '../../../routes/paths';
import { preloadOnIntent } from '../../../routes/routeModules';
import styles from './FeaturedCoursesSection.module.css';

type CarouselItem =
  { kind: 'course'; course: CourseSummary } | { kind: 'all' } | { kind: 'skeleton'; id: number };

const SKELETON_ITEMS: CarouselItem[] = Array.from({ length: 5 }, (_, id) => ({
  kind: 'skeleton',
  id,
}));

function getKey(item: CarouselItem) {
  if (item.kind === 'course') return item.course.id;
  if (item.kind === 'skeleton') return `skeleton-${item.id}`;
  return 'all';
}

function renderItem(item: CarouselItem) {
  if (item.kind === 'course') return <CourseCard course={item.course} />;
  if (item.kind === 'skeleton') return <CourseCardSkeleton />;
  return <AllCoursesCard />;
}

export function FeaturedCoursesSection() {
  const { data, isPending, isError, refetch, isFetching } = useCourseList({ featured: true });

  const items: CarouselItem[] = isPending
    ? SKELETON_ITEMS
    : [
        ...(data?.items ?? []).map((course) => ({ kind: 'course' as const, course })),
        { kind: 'all' },
      ];

  return (
    <section className={styles.section} aria-labelledby="principais-cursos">
      <div className="container">
        <SectionHeading id="principais-cursos" title="Principais cursos" />
      </div>

      {isError ? (
        <div className="container">
          <StateMessage
            role="alert"
            headingLevel="h3"
            icon="error"
            title="Não foi possível carregar os cursos"
            description="Verifique sua conexão e tente novamente."
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
        </div>
      ) : (
        <>
          {isPending ? (
            <p role="status" className="visually-hidden">
              Carregando cursos…
            </p>
          ) : null}
          <Carousel
            label="Principais cursos"
            items={items}
            getKey={getKey}
            renderItem={renderItem}
            busy={isPending}
            className={styles.carousel}
            footerStart={
              <ButtonLink
                to={paths.catalog}
                variant="outline"
                size="sm"
                {...preloadOnIntent('catalog')}
              >
                Ver todos os cursos
              </ButtonLink>
            }
          />
        </>
      )}
    </section>
  );
}
