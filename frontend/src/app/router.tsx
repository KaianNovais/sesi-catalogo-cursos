import { createBrowserRouter } from 'react-router';
import { NotFoundPage } from '@/presentation/features/errors/NotFoundPage';
import { PageLoader } from '@/presentation/features/errors/PageLoader';
import { RouteErrorPage } from '@/presentation/features/errors/RouteErrorPage';
// A página inicial é carregada junto com o app (não é lazy): é a porta de entrada
// e a imagem do hero (maior elemento da tela/LCP) começa a baixar mais cedo.
import { HomePage } from '@/presentation/features/home/HomePage';
import { RootLayout } from '@/presentation/layouts/RootLayout';
import { SiteLayout, type RouteHandle } from '@/presentation/layouts/SiteLayout';
import { routeModules } from '@/presentation/routes/routeModules';

/**
 * Demais rotas com carregamento sob demanda (code splitting): cada página vira
 * um arquivo separado, baixado apenas quando acessado (ou antecipado no hover).
 */
export const router = createBrowserRouter([
  {
    // Raiz sem interface: um único ScrollRestoration para o site e o AVA (RootLayout).
    Component: RootLayout,
    ErrorBoundary: RouteErrorPage,
    children: [
      {
        Component: SiteLayout,
        HydrateFallback: PageLoader,
        ErrorBoundary: RouteErrorPage,
        children: [
          {
            // Erros das páginas são exibidos dentro do layout (cabeçalho e rodapé continuam visíveis).
            ErrorBoundary: RouteErrorPage,
            children: [
              {
                index: true,
                handle: { header: 'overlay' } satisfies RouteHandle,
                Component: HomePage,
              },
              {
                path: 'cursos',
                handle: { search: true } satisfies RouteHandle,
                lazy: async () => ({ Component: (await routeModules.catalog()).CatalogPage }),
              },
              {
                path: 'cursos/:slug',
                handle: { header: 'static' } satisfies RouteHandle,
                lazy: async () => ({
                  Component: (await routeModules.courseDetails()).CourseDetailsPage,
                }),
              },
              {
                path: 'institucional/:slug',
                lazy: async () => ({ Component: (await routeModules.info()).InfoPage }),
              },
              {
                path: 'acessibilidade',
                lazy: async () => ({
                  Component: (await routeModules.accessibility()).AccessibilityPage,
                }),
              },
              { path: '*', Component: NotFoundPage },
            ],
          },
        ],
      },
      {
        // Área do aluno (AVA) tem layout próprio, sem cabeçalho e rodapé do site.
        path: 'area-do-aluno',
        HydrateFallback: PageLoader,
        ErrorBoundary: RouteErrorPage,
        children: [
          {
            index: true,
            lazy: async () => ({ Component: (await routeModules.learning()).StudentAreaRedirect }),
          },
          {
            path: ':slug',
            lazy: async () => ({ Component: (await routeModules.learning()).LearningPage }),
          },
        ],
      },
    ],
  },
]);
