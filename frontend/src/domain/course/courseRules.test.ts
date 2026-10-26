import { describe, expect, it } from 'vitest';
import { canEnroll, countLessons } from './courseRules';

describe('canEnroll', () => {
  it('permite matrícula apenas com inscrições abertas', () => {
    expect(canEnroll({ status: { code: 'inscricoes-abertas', name: 'Inscrições abertas' } })).toBe(
      true,
    );
    expect(canEnroll({ status: { code: 'em-breve', name: 'Em breve' } })).toBe(false);
    expect(canEnroll({ status: { code: 'encerrado', name: 'Encerrado' } })).toBe(false);
  });
});

describe('countLessons', () => {
  it('soma as aulas de todos os módulos', () => {
    const lesson = { title: 'Aula', description: 'Descrição' };
    expect(
      countLessons([
        { title: 'A', lessons: [lesson, lesson] },
        { title: 'B', lessons: [lesson] },
      ]),
    ).toBe(3);
  });
});
