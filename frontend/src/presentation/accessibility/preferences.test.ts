import { describe, expect, it } from 'vitest';
import indexHtml from '../../../index.html?raw';
import {
  applyPreferences,
  DEFAULT_PREFERENCES,
  parsePreferences,
  PREFERENCES_STORAGE_KEY,
  type AccessibilityPreferences,
} from './preferences';

const ALL_ON: AccessibilityPreferences = {
  textSize: '150',
  highContrast: true,
  wideSpacing: true,
  underlineLinks: true,
  reduceMotion: true,
  libras: true,
};

function attributesOf(element: Element) {
  return Object.fromEntries(
    [...element.attributes].map((attribute) => [attribute.name, attribute.value]),
  );
}

describe('parsePreferences', () => {
  it('usa o padrão quando não há nada salvo ou o valor não é JSON', () => {
    expect(parsePreferences(null)).toEqual(DEFAULT_PREFERENCES);
    expect(parsePreferences('{quebrado')).toEqual(DEFAULT_PREFERENCES);
    expect(parsePreferences('"texto"')).toEqual(DEFAULT_PREFERENCES);
  });

  it('aproveita os campos válidos e descarta os inválidos', () => {
    const raw = JSON.stringify({ textSize: '150', highContrast: 'sim', libras: true, extra: 1 });

    expect(parsePreferences(raw)).toEqual({
      ...DEFAULT_PREFERENCES,
      textSize: '150',
      libras: true,
    });
    expect(parsePreferences(JSON.stringify({ textSize: '200' })).textSize).toBe('100');
  });
});

describe('applyPreferences', () => {
  it('reflete as escolhas em atributos do <html> e remove os que voltaram ao padrão', () => {
    const root = document.createElement('html');

    applyPreferences(ALL_ON, root);
    expect(attributesOf(root)).toEqual({
      'data-text-size': '150',
      'data-contrast': 'high',
      'data-text-spacing': 'wide',
      'data-links': 'underline',
      'data-motion': 'reduce',
    });

    applyPreferences(DEFAULT_PREFERENCES, root);
    expect(attributesOf(root)).toEqual({});
  });

  it('tem o mesmo resultado do script inline do index.html (aplicado antes da primeira pintura)', () => {
    const inlineScript = /<script>\s*(\/\/ Preferências[\s\S]*?)<\/script>/.exec(indexHtml)?.[1];
    expect(inlineScript).toBeDefined();

    for (const preferences of [
      ALL_ON,
      { ...ALL_ON, textSize: '125' as const },
      DEFAULT_PREFERENCES,
    ]) {
      const expected = document.createElement('html');
      applyPreferences(preferences, expected);

      const root = document.documentElement;
      [...root.attributes].forEach((attribute) => root.removeAttribute(attribute.name));
      window.localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
      new Function(inlineScript ?? '')();

      expect(attributesOf(root)).toEqual(attributesOf(expected));
    }

    [...document.documentElement.attributes].forEach((attribute) =>
      document.documentElement.removeAttribute(attribute.name),
    );
    window.localStorage.clear();
  });
});
