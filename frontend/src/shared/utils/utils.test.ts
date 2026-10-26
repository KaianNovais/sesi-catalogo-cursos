import { describe, expect, it } from 'vitest';
import { formatDate, parseIsoDate } from './date';
import { normalizeText, pluralize } from './text';

describe('datas', () => {
  it('formata datas ISO sem deslocar o dia por causa do fuso horário', () => {
    expect(formatDate('2027-01-05')).toBe('05/01/2027');
  });

  it('rejeita datas inválidas', () => {
    expect(parseIsoDate('05/01/2027')).toBeNull();
    expect(formatDate('não é data')).toBe('');
  });
});

describe('texto', () => {
  it('normaliza para busca sem acentos e sem diferenciar maiúsculas', () => {
    expect(normalizeText('  Ciências da NATUREZA ')).toBe('ciencias da natureza');
  });

  it('pluraliza em português', () => {
    expect(pluralize(1, 'curso encontrado', 'cursos encontrados')).toBe('1 curso encontrado');
    expect(pluralize(3, 'curso encontrado', 'cursos encontrados')).toBe('3 cursos encontrados');
  });
});
