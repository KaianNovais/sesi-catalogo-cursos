/**
 * Raiz de composição: único ponto que conhece as implementações concretas.
 * Troca a fonte de dados (API .NET ou mock em memória) via variável de ambiente.
 */
import type { Dependencies } from '@/application/dependencies';
import type { CourseRepository } from '@/domain/course/CourseRepository';
import { env } from '@/infrastructure/config/env';
import { createHttpCourseRepository } from '@/infrastructure/course/httpCourseRepository';
import { createHttpClient } from '@/infrastructure/http/httpClient';

/**
 * Carrega a implementação em um chunk separado: no modo mock, os dados fictícios não pesam no
 * bundle principal. Com `preload`, o download começa junto com o app, em paralelo com o código da
 * página; sem isso, a primeira consulta esperaria o chunk da página e só então o dos dados, o que
 * atrasa a primeira foto do catálogo (o LCP no celular).
 */
function lazyRepository(
  load: () => Promise<CourseRepository>,
  { preload = false } = {},
): CourseRepository {
  let instance: Promise<CourseRepository> | undefined;
  const get = () => (instance ??= load());
  if (preload) {
    get().catch(() => {
      instance = undefined; // falhou (ex.: rede): a primeira consulta tenta de novo
    });
  }
  return {
    list: async (...args) => (await get()).list(...args),
    getBySlug: async (...args) => (await get()).getBySlug(...args),
    listCategories: async (...args) => (await get()).listCategories(...args),
    listModalities: async (...args) => (await get()).listModalities(...args),
    listStatuses: async (...args) => (await get()).listStatuses(...args),
  };
}

export function createDependencies(): Dependencies {
  if (env.apiMode === 'mock') {
    return {
      courseRepository: lazyRepository(
        async () => {
          const { createInMemoryCourseRepository } =
            await import('@/infrastructure/course/inMemoryCourseRepository');
          return createInMemoryCourseRepository({
            latencyMs: env.mockLatencyMs,
            // Acesse qualquer página com ?simularErro para ver o estado de erro.
            shouldFail: () => new URLSearchParams(window.location.search).has('simularErro'),
          });
        },
        { preload: true },
      ),
    };
  }

  const http = createHttpClient({ baseUrl: env.apiBaseUrl, timeoutMs: env.requestTimeoutMs });
  return { courseRepository: createHttpCourseRepository(http) };
}
