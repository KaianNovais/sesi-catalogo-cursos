import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import type { Dependencies } from '@/application/dependencies';
import { DependenciesContext } from '@/presentation/providers/dependencies';

interface AppProvidersProps {
  dependencies: Dependencies;
  queryClient: QueryClient;
  children: ReactNode;
}

export function AppProviders({ dependencies, queryClient, children }: AppProvidersProps) {
  return (
    <DependenciesContext value={dependencies}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </DependenciesContext>
  );
}
