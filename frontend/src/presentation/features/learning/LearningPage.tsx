import { useEffect, useRef } from 'react';
import { Navigate, useNavigationType, useParams, useSearchParams } from 'react-router';
import type { Course } from '@/domain/course/Course';
import { NotFoundError } from '@/domain/errors';
import { formatDate } from '@/shared/utils/date';
import { prefersReducedMotion } from '../../accessibility/motion';
import { Button, ButtonLink } from '../../components/Button/Button';
import { SkipLinks } from '../../components/SkipLinks/SkipLinks';
import { StateMessage } from '../../components/StateMessage/StateMessage';
import { site } from '../../content/site';
import { useCourseDetails } from '../../queries/courseQueries';
import { anchors } from '../../routes/anchors';
import { coursePath, learningPath, paths } from '../../routes/paths';
import { buildOutline, flattenLessons, type OutlineLesson } from './learningModel';
import { LearningSidebar } from './LearningSidebar';
import { LessonContent } from './LessonContent';
import { useLearningProgress } from './useLearningProgress';
import styles from './Learning.module.css';

function LearningView({ course }: { course: Course }) {
  const outline = buildOutline(course);
  const lessons = flattenLessons(outline);
  const firstLesson = lessons[0] as OutlineLesson;
  // Estado inicial igual ao protótipo: primeira aula concluída, segunda em andamento.
  const { completed, toggle } = useLearningProgress(course.slug, [firstLesson.id]);
  const [searchParams, setSearchParams] = useSearchParams();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const contentRef = useRef<HTMLElement>(null);
  const arrivedByLink = useRef(useNavigationType() !== 'POP');

  // Chegando por um link do site (ex.: "Área do aluno"), o foco vai para o título da aula, como nas
  // trocas de aula; no primeiro carregamento da página o foco fica onde o navegador o deixa.
  useEffect(() => {
    if (arrivedByLink.current) headingRef.current?.focus({ preventScroll: true });
  }, []);

  const requestedId = searchParams.get('aula');
  const current =
    lessons.find((lesson) => lesson.id === requestedId) ??
    lessons.find((lesson) => !completed.has(lesson.id)) ??
    firstLesson;
  const index = lessons.indexOf(current);
  const completedCount = lessons.filter((lesson) => completed.has(lesson.id)).length;
  const progress = Math.round((completedCount / lessons.length) * 100);

  function goTo(lesson: OutlineLesson) {
    // Sem voltar ao topo: a rolagem até o conteúdo da aula é feita logo abaixo.
    setSearchParams({ aula: lesson.id }, { preventScrollReset: true });
    contentRef.current?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    // Foco no título da nova aula: leitores de tela anunciam a troca de conteúdo.
    requestAnimationFrame(() => headingRef.current?.focus({ preventScroll: true }));
  }

  return (
    <div className={styles.layout}>
      <title>{`${current.title} | ${course.shortName} | Área do aluno`}</title>
      <SkipLinks targets={['content', 'menu']} />
      <LearningSidebar
        course={course}
        outline={outline}
        currentLesson={current}
        completed={completed}
        progress={progress}
        onSelectLesson={goTo}
      />
      <main id={anchors.content} ref={contentRef} tabIndex={-1} className={styles.content}>
        <LessonContent
          course={course}
          lesson={current}
          previous={lessons[index - 1]}
          next={lessons[index + 1]}
          done={completed.has(current.id)}
          headingRef={headingRef}
          onToggleDone={() => toggle(current.id)}
          onNavigate={goTo}
        />
      </main>
    </div>
  );
}

/** Atalho "Área do aluno" do cabeçalho: abre o AVA do curso usado no protótipo. */
export function StudentAreaRedirect() {
  return <Navigate to={learningPath(site.demoCourseSlug)} replace />;
}

export function LearningPage() {
  const { slug = '' } = useParams();
  const { data: course, isPending, isError, error, refetch, isFetching } = useCourseDetails(slug);

  if (isPending) {
    return (
      <div className={styles.statePage} role="status">
        Carregando o ambiente de aprendizagem…
      </div>
    );
  }

  if (isError) {
    const notFound = error instanceof NotFoundError;
    return (
      <div className={styles.statePage}>
        <title>Área do aluno | SESI Indústria</title>
        <StateMessage
          role={notFound ? undefined : 'alert'}
          headingLevel="h1"
          icon={notFound ? 'searchOff' : 'error'}
          title={notFound ? 'Curso não encontrado' : 'Não foi possível abrir o curso'}
          description={
            notFound
              ? 'Verifique o endereço ou escolha um curso no catálogo.'
              : 'O serviço de cursos não respondeu. Verifique sua conexão e tente novamente.'
          }
          action={
            notFound ? (
              <ButtonLink to={paths.catalog} variant="dark">
                Ir para o catálogo
              </ButtonLink>
            ) : (
              <Button
                variant="dark"
                startIcon="refresh"
                disabled={isFetching}
                onClick={() => refetch()}
              >
                Tentar novamente
              </Button>
            )
          }
        />
      </div>
    );
  }

  // Regra de negócio: o conteúdo só fica disponível a partir da data de disponibilização.
  if (course.status.code === 'em-breve') {
    return (
      <div className={styles.statePage}>
        <title>{`${course.shortName} | Área do aluno`}</title>
        <StateMessage
          headingLevel="h1"
          icon="calendar"
          title="Este curso ainda não está disponível"
          description={
            course.availableFrom
              ? `O conteúdo será liberado em ${formatDate(course.availableFrom)}.`
              : 'O conteúdo será liberado em breve.'
          }
          action={
            <ButtonLink to={coursePath(course.slug)} variant="dark">
              Ver detalhes do curso
            </ButtonLink>
          }
        />
      </div>
    );
  }

  return <LearningView key={course.slug} course={course} />;
}
