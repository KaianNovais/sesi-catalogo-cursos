import { useSyncExternalStore } from 'react';
import {
  applyPreferences,
  DEFAULT_PREFERENCES,
  parsePreferences,
  PREFERENCES_STORAGE_KEY,
  type AccessibilityPreferences,
} from './preferences';
import { disableVLibras, enableVLibras, getVLibrasStatus } from './vlibras';

/**
 * Estado das preferências de acessibilidade, compartilhado pela página inteira (cabeçalho, AVA e
 * menu) e sincronizado entre abas pelo evento `storage`.
 */
function readStored(): AccessibilityPreferences {
  try {
    return parsePreferences(window.localStorage.getItem(PREFERENCES_STORAGE_KEY));
  } catch {
    // Navegação privada com armazenamento bloqueado: segue com o padrão.
    return DEFAULT_PREFERENCES;
  }
}

let current = readStored();
const listeners = new Set<() => void>();

function commit(next: AccessibilityPreferences) {
  current = next;
  applyPreferences(current);
  listeners.forEach((listener) => listener());
}

function persist() {
  try {
    window.localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(current));
  } catch {
    // Sem armazenamento, a escolha vale só até recarregar a página.
  }
}

export function getPreferences(): AccessibilityPreferences {
  return current;
}

export function updatePreferences(changes: Partial<AccessibilityPreferences>): void {
  commit({ ...current, ...changes });
  persist();
}

export function resetPreferences(): void {
  // Também cancela uma ativação do VLibras que ainda esteja carregando.
  if (current.libras || getVLibrasStatus() !== 'idle') disableVLibras();
  commit(DEFAULT_PREFERENCES);
  try {
    window.localStorage.removeItem(PREFERENCES_STORAGE_KEY);
  } catch {
    // Ver persist().
  }
}

/** Ativa o tradutor de Libras e salva a escolha só se ele ficar pronto (e ninguém desativou antes). */
export async function activateLibras(): Promise<boolean> {
  const ready = await enableVLibras();
  if (ready) updatePreferences({ libras: true });
  return ready;
}

export function deactivateLibras(): void {
  disableVLibras();
  updatePreferences({ libras: false });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useAccessibilityPreferences(): AccessibilityPreferences {
  return useSyncExternalStore(subscribe, getPreferences, () => DEFAULT_PREFERENCES);
}

/**
 * Chamada uma vez na inicialização: confirma os atributos do <html> (o script inline do
 * index.html já os aplicou), acompanha mudanças feitas em outra aba e, se o usuário já tinha
 * ativado o VLibras, carrega o tradutor quando o navegador estiver ocioso.
 */
export function initAccessibilityPreferences(): void {
  applyPreferences(current);

  window.addEventListener('storage', (event) => {
    if (event.key !== PREFERENCES_STORAGE_KEY) return;
    const previous = current;
    commit(parsePreferences(event.newValue));
    if (previous.libras && !current.libras) disableVLibras();
    else if (!previous.libras && current.libras) void enableVLibras();
  });

  if (current.libras) {
    // Falha vira o estado "error" do VLibras, e o menu oferece "Tentar novamente".
    const load = () => {
      if (current.libras) void enableVLibras();
    };
    if ('requestIdleCallback' in window) window.requestIdleCallback(load);
    else setTimeout(load, 1);
  }
}
