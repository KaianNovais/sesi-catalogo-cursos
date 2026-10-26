import type { Ref } from 'react';
import banner800 from '@/assets/images/banner-ava-800.webp';
import banner1600 from '@/assets/images/banner-ava-1600.webp';
import type { Course } from '@/domain/course/Course';
import { Button } from '../../components/Button/Button';
import { Logo } from '../../components/Logo/Logo';
import { getCourseLessonContent, getIntroLessonContent } from '../../content/learning';
import type { OutlineLesson } from './learningModel';
import styles from './Learning.module.css';

interface LessonContentProps {
  course: Course;
  lesson: OutlineLesson;
  previous: OutlineLesson | undefined;
  next: OutlineLesson | undefined;
  done: boolean;
  headingRef: Ref<HTMLHeadingElement>;
  onToggleDone: () => void;
  onNavigate: (lesson: OutlineLesson) => void;
}

export function LessonContent({
  course,
  lesson,
  previous,
  next,
  done,
  headingRef,
  onToggleDone,
  onNavigate,
}: LessonContentProps) {
  const sections =
    lesson.kind === 'intro'
      ? getIntroLessonContent(lesson.id, course)
      : getCourseLessonContent(lesson);

  return (
    <article className={styles.lesson}>
      <div className={styles.banner}>
        <img
          src={banner1600}
          srcSet={`${banner800} 800w, ${banner1600} 1600w`}
          sizes="(min-width: 64rem) 922px, 100vw"
          alt=""
          width={1600}
          height={890}
          className={styles.bannerImage}
        />
        <Logo variant="sesi" className={styles.bannerLogo} />
      </div>

      <header className={styles.lessonHeader}>
        <h1 ref={headingRef} tabIndex={-1} className={styles.lessonTitle}>
          {lesson.title}
        </h1>
      </header>

      {sections.map((section) => (
        <section key={section.heading} className={styles.lessonSection}>
          {section.heading !== lesson.title ? (
            <h2 className={styles.sectionTitle}>{section.heading}</h2>
          ) : null}
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          {section.items ? (
            <ul>
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}

      <nav aria-label="Navegação entre aulas" className={styles.lessonNav}>
        <Button
          variant="outline"
          startIcon="arrowLeft"
          disabled={!previous}
          onClick={() => previous && onNavigate(previous)}
        >
          Aula anterior
        </Button>
        <Button
          variant={done ? 'outline' : 'dark'}
          startIcon={done ? 'checkCircle' : undefined}
          aria-pressed={done}
          onClick={onToggleDone}
        >
          {done ? 'Aula concluída' : 'Marcar como concluída'}
        </Button>
        <Button
          variant="dark"
          endIcon="arrowRight"
          disabled={!next}
          onClick={() => next && onNavigate(next)}
        >
          Próxima aula
        </Button>
      </nav>
    </article>
  );
}
