import { getPreferences } from './preferencesStore';

/**
 * Preferência por menos movimento (animações e rolagem suave): a escolhida no menu "Acessibilidade"
 * ou a do sistema.
 */
export function prefersReducedMotion(): boolean {
  if (getPreferences().reduceMotion) return true;
  return (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}
