import { useId, useState } from 'react';
import { Link } from 'react-router';
import type { Course } from '@/domain/course/Course';
import { cx } from '@/shared/utils/cx';
import { pluralize } from '@/shared/utils/text';
import { AccessibilityMenu } from '../../components/AccessibilityMenu/AccessibilityMenu';
import { SearchField } from '../../components/FormField/SearchField';
import { Icon } from '../../components/Icon/Icon';
import { anchors } from '../../routes/anchors';
import { coursePath } from '../../routes/paths';
import { filterOutline, type OutlineLesson, type OutlineModule } from './learningModel';
import styles from './Learning.module.css';

interface LearningSidebarProps {
  course: Course;
  outline: OutlineModule[];
  currentLesson: OutlineLesson;
  completed: ReadonlySet<string>;
  progress: number;
  onSelectLesson: (lesson: OutlineLesson) => void;
}

function lessonIcon(done: boolean, current: boolean) {
  if (done) return 'checkCircle' as const;
  if (current) return 'playCircle' as const;
  return 'circle' as const;
}

export function LearningSidebar({
  course,
  outline,
  currentLesson,
  completed,
  progress,
  onSelectLesson,
}: LearningSidebarProps) {
  // O sumário usa o id do "menu" para o atalho "Ir para o menu [2]" funcionar também no AVA.
  const outlineId = anchors.menu;
  const listIdPrefix = useId();
  const [search, setSearch] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const currentModuleId = outline.find((module) => module.lessons.includes(currentLesson))?.id;
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(
    () => new Set(currentModuleId ? [currentModuleId] : []),
  );

  const visibleOutline = filterOutline(outline, search);
  const searching = search.trim().length > 0;
  const totalLessons = outline.reduce((total, module) => total + module.lessons.length, 0);

  function toggleModule(moduleId: string) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  }

  function selectLesson(lesson: OutlineLesson) {
    setMobileOpen(false);
    onSelectLesson(lesson);
  }

  return (
    <aside className={styles.sidebar} aria-label="Conteúdo do curso">
      <div className={styles.topbar}>
        <Link
          to={coursePath(course.slug)}
          className={styles.backLink}
          aria-label="Voltar para a página do curso"
        >
          <Icon name="back" size={24} />
        </Link>
        <AccessibilityMenu className={styles.accessibility} />
      </div>

      <div className={styles.courseHeader}>
        <p className={styles.eyebrow}>Certificação</p>
        <p className={styles.courseTitle}>{course.fullName}</p>
        <div className={styles.progress}>
          <div
            role="progressbar"
            aria-label="Progresso no curso"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            className={styles.progressTrack}
          >
            <span className={styles.progressFill} style={{ inlineSize: `${progress}%` }} />
          </div>
          <span className={styles.progressValue}>{progress}%</span>
        </div>
      </div>

      <button
        type="button"
        className={styles.outlineToggle}
        aria-expanded={mobileOpen}
        aria-controls={outlineId}
        onClick={() => setMobileOpen((open) => !open)}
      >
        <span>Conteúdo do curso ({pluralize(totalLessons, 'aula', 'aulas')})</span>
        <Icon
          name="chevronDown"
          size={20}
          className={cx(styles.toggleIcon, mobileOpen && styles.toggleIconOpen)}
        />
      </button>

      <div id={outlineId} className={cx(styles.outline, mobileOpen && styles.outlineOpen)}>
        <SearchField
          label="Buscar aula"
          hideLabel
          variant="compact"
          value={search}
          onChange={setSearch}
          className={styles.outlineSearch}
        />

        <nav aria-label="Módulos e aulas" className={styles.outlineNav}>
          {visibleOutline.length === 0 ? (
            <p className={styles.outlineEmpty} role="status">
              Nenhuma aula encontrada.
            </p>
          ) : (
            <ol role="list" className={styles.modules}>
              {visibleOutline.map((module) => {
                // O módulo da aula atual fica sempre aberto (ex.: ao avançar de 1.3 para 2.1).
                const isExpanded =
                  searching ||
                  expanded.has(module.id) ||
                  module.lessons.some((lesson) => lesson.id === currentLesson.id);
                const listId = `${listIdPrefix}-${module.id}`;
                return (
                  <li key={module.id} className={styles.module}>
                    <button
                      type="button"
                      className={styles.moduleButton}
                      aria-expanded={isExpanded}
                      aria-controls={listId}
                      onClick={() => toggleModule(module.id)}
                    >
                      <span>
                        {module.number}. {module.title}
                      </span>
                    </button>
                    <ol role="list" id={listId} hidden={!isExpanded} className={styles.lessons}>
                      {module.lessons.map((lesson) => {
                        const isCurrent = lesson.id === currentLesson.id;
                        const isDone = completed.has(lesson.id);
                        return (
                          <li key={lesson.id}>
                            <button
                              type="button"
                              className={styles.lessonButton}
                              aria-current={isCurrent ? 'step' : undefined}
                              onClick={() => selectLesson(lesson)}
                            >
                              <Icon
                                name={lessonIcon(isDone, isCurrent)}
                                size={20}
                                className={styles.lessonIcon}
                              />
                              <span>
                                {lesson.number} {lesson.title}
                                {isDone ? (
                                  <span className="visually-hidden"> (concluída)</span>
                                ) : null}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ol>
                  </li>
                );
              })}
            </ol>
          )}
        </nav>
      </div>
    </aside>
  );
}
