import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router';
import type { CourseRepository } from '@/domain/course/CourseRepository';
import { createInMemoryCourseRepository } from '@/infrastructure/course/inMemoryCourseRepository';
import { DependenciesContext } from '@/presentation/providers/dependencies';

interface Options {
  /** Rota inicial (ex.: "/cursos?busca=metal"). */
  route?: string;
  /** Padrão de rota que renderiza o componente (ex.: "/cursos/:slug"). */
  path?: string;
  repository?: CourseRepository;
}

/** Renderiza com as mesmas dependências da aplicação real (DI + React Query + Router). */
export function renderWithProviders(
  ui: ReactElement,
  { route = '/', path = '*', repository = createInMemoryCourseRepository() }: Options = {},
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });

  return {
    repository,
    ...render(
      <DependenciesContext value={{ courseRepository: repository }}>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={[route]}>
            <Routes>
              <Route path={path} element={ui} />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>
      </DependenciesContext>,
    ),
  };
}
