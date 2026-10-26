import { useEffect, useState } from 'react';

const storageKey = (courseSlug: string) => `ava:${courseSlug}:aulas-concluidas`;

function readCompleted(courseSlug: string, fallback: string[]): Set<string> {
  try {
    const stored = window.localStorage.getItem(storageKey(courseSlug));
    const parsed: unknown = stored ? JSON.parse(stored) : null;
    if (Array.isArray(parsed) && parsed.every((item) => typeof item === 'string')) {
      return new Set(parsed);
    }
  } catch {
    // Armazenamento indisponível (modo privado, bloqueio de cookies): segue sem persistir.
  }
  return new Set(fallback);
}

/**
 * Progresso do aluno na demonstração do AVA, salvo no navegador (localStorage).
 * Em produção viria do Moodle (core_completion_get_activities_completion_status).
 */
export function useLearningProgress(courseSlug: string, initialCompleted: string[]) {
  const [completed, setCompleted] = useState(() => readCompleted(courseSlug, initialCompleted));

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey(courseSlug), JSON.stringify([...completed]));
    } catch {
      // Ignora falhas de escrita (ver readCompleted).
    }
  }, [courseSlug, completed]);

  function toggle(lessonId: string) {
    setCompleted((current) => {
      const next = new Set(current);
      if (next.has(lessonId)) next.delete(lessonId);
      else next.add(lessonId);
      return next;
    });
  }

  function markAsCompleted(lessonId: string) {
    setCompleted((current) => (current.has(lessonId) ? current : new Set(current).add(lessonId)));
  }

  return { completed, toggle, markAsCompleted };
}
