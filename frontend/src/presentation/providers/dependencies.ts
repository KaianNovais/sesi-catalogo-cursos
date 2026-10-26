import { createContext, use } from 'react';
import type { Dependencies } from '@/application/dependencies';

/** Injeção de dependências via contexto (a raiz da aplicação fornece as implementações). */
export const DependenciesContext = createContext<Dependencies | null>(null);

export function useDependencies(): Dependencies {
  const dependencies = use(DependenciesContext);
  if (!dependencies) {
    throw new Error('useDependencies deve ser usado dentro de <DependenciesContext>.');
  }
  return dependencies;
}
