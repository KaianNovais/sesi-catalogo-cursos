/**
 * Preferências do menu "Acessibilidade". Ficam salvas no navegador e viram atributos `data-*` no
 * <html>, que o CSS global (src/app/styles/accessibility.css) usa para ajustar a página.
 *
 * O script inline do index.html aplica os mesmos atributos antes da primeira pintura (sem "piscar"
 * o tamanho ou o contraste): ao mudar chaves, valores ou atributos aqui, atualize-o também.
 */
export const PREFERENCES_STORAGE_KEY = 'a11y:preferences';

export const TEXT_SIZES = ['100', '125', '150'] as const;
export type TextSize = (typeof TEXT_SIZES)[number];

export interface AccessibilityPreferences {
  /** Tamanho do texto em % (o zoom do navegador continua disponível até 400%). */
  textSize: TextSize;
  highContrast: boolean;
  /** Espaçamento de letras, palavras e linhas com os valores do critério 1.4.12 da WCAG. */
  wideSpacing: boolean;
  underlineLinks: boolean;
  reduceMotion: boolean;
  /** Tradutor de Libras (VLibras), carregado só depois que o usuário o ativa. */
  libras: boolean;
}

export const DEFAULT_PREFERENCES: AccessibilityPreferences = {
  textSize: '100',
  highContrast: false,
  wideSpacing: false,
  underlineLinks: false,
  reduceMotion: false,
  libras: false,
};

function isTextSize(value: unknown): value is TextSize {
  return TEXT_SIZES.some((size) => size === value);
}

function readFlag(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

/** Lê o JSON salvo; campos ausentes ou inválidos (versão antiga, edição manual) voltam ao padrão. */
export function parsePreferences(raw: string | null): AccessibilityPreferences {
  let stored: unknown;
  try {
    stored = raw ? JSON.parse(raw) : null;
  } catch {
    return DEFAULT_PREFERENCES;
  }
  if (typeof stored !== 'object' || stored === null) return DEFAULT_PREFERENCES;

  const data = stored as Record<string, unknown>;
  const defaults = DEFAULT_PREFERENCES;
  return {
    textSize: isTextSize(data.textSize) ? data.textSize : defaults.textSize,
    highContrast: readFlag(data.highContrast, defaults.highContrast),
    wideSpacing: readFlag(data.wideSpacing, defaults.wideSpacing),
    underlineLinks: readFlag(data.underlineLinks, defaults.underlineLinks),
    reduceMotion: readFlag(data.reduceMotion, defaults.reduceMotion),
    libras: readFlag(data.libras, defaults.libras),
  };
}

function setAttribute(root: HTMLElement, name: string, value: string | null) {
  if (value === null) root.removeAttribute(name);
  else root.setAttribute(name, value);
}

/** Reflete as preferências em atributos do <html> (o padrão não deixa atributo nenhum). */
export function applyPreferences(
  preferences: AccessibilityPreferences,
  root: HTMLElement = document.documentElement,
): void {
  setAttribute(
    root,
    'data-text-size',
    preferences.textSize === '100' ? null : preferences.textSize,
  );
  setAttribute(root, 'data-contrast', preferences.highContrast ? 'high' : null);
  setAttribute(root, 'data-text-spacing', preferences.wideSpacing ? 'wide' : null);
  setAttribute(root, 'data-links', preferences.underlineLinks ? 'underline' : null);
  setAttribute(root, 'data-motion', preferences.reduceMotion ? 'reduce' : null);
}
