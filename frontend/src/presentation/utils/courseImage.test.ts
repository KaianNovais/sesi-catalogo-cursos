import { describe, expect, it } from 'vitest';
import { getCourseImageSrcSet } from './courseImage';

describe('getCourseImageSrcSet', () => {
  it('gera o srcset das imagens hospedadas pela aplicação (600px e 1200px)', () => {
    expect(getCourseImageSrcSet('/images/courses/quimica-e-sustentabilidade.webp')).toBe(
      '/images/courses/quimica-e-sustentabilidade-600.webp 600w, /images/courses/quimica-e-sustentabilidade.webp 1200w',
    );
  });

  it('não inventa variantes para imagens externas (ex.: vindas do Moodle)', () => {
    expect(
      getCourseImageSrcSet(
        'https://moodle.exemplo.com/pluginfile.php/1/course/overviewfiles/a.jpg',
      ),
    ).toBeUndefined();
  });
});
