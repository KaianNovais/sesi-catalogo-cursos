import searchCases from '@data/search-cases.json';
import { describe, expect, it } from 'vitest';
import { createInMemoryCourseRepository } from '@/infrastructure/course/inMemoryCourseRepository';
import { listCourses } from './courses';

describe('listCourses: busca igual à da API', () => {
  // Os mesmos casos rodam contra a API .NET (SearchParityTests): front e back-end buscam igual.
  const repository = createInMemoryCourseRepository();

  it.each(searchCases.cases)('busca "$search"', async ({ search, slugs }) => {
    const result = await listCourses(repository, { search });

    expect(result.items.map((course) => course.slug)).toEqual(slugs);
  });
});
