import seed from '@data/courses.seed.json';
import { describe, expect, it } from 'vitest';
import { NotFoundError, ServiceUnavailableError } from '@/domain/errors';
import { buildCatalog, createInMemoryCourseRepository } from './inMemoryCourseRepository';

describe('dados fictícios (seed)', () => {
  // Requisitos mínimos do enunciado (seção 4.b), verificados automaticamente.
  const catalog = buildCatalog(seed);

  it('atende às quantidades mínimas exigidas', () => {
    expect(catalog.length).toBeGreaterThanOrEqual(6);
    expect(new Set(catalog.map((course) => course.category.slug)).size).toBeGreaterThanOrEqual(3);
    expect(new Set(catalog.map((course) => course.modality.code)).size).toBeGreaterThanOrEqual(2);
    expect(new Set(catalog.map((course) => course.status.code)).size).toBeGreaterThanOrEqual(3);
  });

  it('tem cargas horárias, módulos e públicos-alvo variados', () => {
    expect(new Set(catalog.map((course) => course.workloadHours)).size).toBeGreaterThan(3);
    expect(new Set(catalog.map((course) => course.modules.length)).size).toBeGreaterThan(2);
    expect(new Set(catalog.map((course) => course.targetAudience)).size).toBe(catalog.length);
  });

  it('preenche todos os campos obrigatórios de cada curso', () => {
    for (const course of catalog) {
      expect(course.fullName).toBeTruthy();
      expect(course.shortName).toBeTruthy();
      expect(course.description).toBeTruthy();
      expect(course.imageUrl).toMatch(/^\/images\/courses\/.+\.webp$/);
      expect(course.workloadHours).toBeGreaterThan(0);
    }
  });

  it('usa slugs únicos', () => {
    expect(new Set(catalog.map((course) => course.slug)).size).toBe(catalog.length);
  });
});

describe('createInMemoryCourseRepository', () => {
  const repository = createInMemoryCourseRepository();

  it('lista todos os cursos sem filtros', async () => {
    const result = await repository.list({});
    expect(result.total).toBe(seed.courses.length);
    expect(result.items).toHaveLength(result.total);
  });

  it('busca pelo nome sem diferenciar acentos e maiúsculas', async () => {
    const result = await repository.list({ search: 'CIENCIA DOS MATERIAIS' });
    expect(result.items.map((course) => course.slug)).toEqual([
      'ciencia-dos-materiais-na-metalurgia',
    ]);
  });

  it('combina busca e filtros', async () => {
    const result = await repository.list({
      search: 'metalurgia',
      category: 'ciencias-da-natureza',
    });
    expect(result.total).toBe(2);
    expect(result.items.every((course) => course.category.slug === 'ciencias-da-natureza')).toBe(
      true,
    );
  });

  it('filtra por modalidade e status', async () => {
    const result = await repository.list({ modality: 'presencial', status: 'encerrado' });
    expect(result.items.map((course) => course.slug)).toEqual(['economia-circular-na-industria']);
  });

  it('retorna lista vazia quando nada corresponde', async () => {
    const result = await repository.list({ search: 'curso inexistente' });
    expect(result).toEqual({ items: [], total: 0 });
  });

  it('retorna os detalhes do curso com módulos', async () => {
    const course = await repository.getBySlug('matematica-para-a-precisao');
    expect(course.modules).toHaveLength(10);
    expect(course.category.name).toBe('Matemática');
  });

  it('lança NotFoundError para curso inexistente', async () => {
    await expect(repository.getBySlug('nao-existe')).rejects.toBeInstanceOf(NotFoundError);
  });

  it('simula indisponibilidade do serviço', async () => {
    const failing = createInMemoryCourseRepository({ shouldFail: () => true });
    await expect(failing.list({})).rejects.toBeInstanceOf(ServiceUnavailableError);
  });
});
