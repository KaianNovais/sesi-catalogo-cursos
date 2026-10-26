import { describe, expect, it } from 'vitest';
import { hasActiveFilters, normalizeFilters, normalizeSearchTerm } from './courseFilters';

describe('normalizeSearchTerm', () => {
  it('remove espaços extras e limita o tamanho', () => {
    expect(normalizeSearchTerm('   física    na   metalurgia ')).toBe('física na metalurgia');
    expect(normalizeSearchTerm('a'.repeat(150))).toHaveLength(100);
    expect(normalizeSearchTerm(undefined)).toBe('');
  });
});

describe('normalizeFilters', () => {
  it('descarta valores vazios para gerar chaves de cache estáveis', () => {
    expect(
      normalizeFilters({ search: '  ', category: '', modality: 'ead', featured: false }),
    ).toEqual({
      modality: 'ead',
    });
  });

  it('mantém todos os critérios combinados', () => {
    expect(
      normalizeFilters({
        search: ' metal ',
        category: 'matematica',
        modality: 'ead',
        status: 'em-breve',
      }),
    ).toEqual({ search: 'metal', category: 'matematica', modality: 'ead', status: 'em-breve' });
  });
});

describe('hasActiveFilters', () => {
  it('ignora "featured", que não é um filtro escolhido pelo usuário', () => {
    expect(hasActiveFilters({ featured: true })).toBe(false);
    expect(hasActiveFilters({ search: '   ' })).toBe(false);
    expect(hasActiveFilters({ status: 'encerrado' })).toBe(true);
  });
});
