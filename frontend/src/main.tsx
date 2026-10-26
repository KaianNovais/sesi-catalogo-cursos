import './app/styles/fonts.css';
import './app/styles/tokens.css';
import './app/styles/base.css';
import './app/styles/accessibility.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router/dom';
import { AppProviders } from './app/AppProviders';
import { createDependencies } from './app/createDependencies';
import { createQueryClient } from './app/queryClient';
import { router } from './app/router';
import { initAccessibilityPreferences } from './presentation/accessibility/preferencesStore';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Elemento #root não encontrado.');

initAccessibilityPreferences();

const dependencies = createDependencies();
const queryClient = createQueryClient();

createRoot(rootElement).render(
  <StrictMode>
    <AppProviders dependencies={dependencies} queryClient={queryClient}>
      <RouterProvider router={router} />
    </AppProviders>
  </StrictMode>,
);
