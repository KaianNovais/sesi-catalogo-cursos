import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '@/test/renderWithProviders';
import { CourseDetailsPage } from './CourseDetailsPage';

function renderCourse(slug: string) {
  return renderWithProviders(<CourseDetailsPage />, {
    route: `/cursos/${slug}`,
    path: '/cursos/:slug',
  });
}

describe('CourseDetailsPage', () => {
  it('exibe os dados do curso e permite a matrícula quando as inscrições estão abertas', async () => {
    renderCourse('matematica-para-a-precisao');

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Matemática para a Precisão: Medidas e Escalas na Metalurgia',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('05/01/2027')).toBeInTheDocument();
    expect(screen.getByText('40 horas')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Matricule-se' })[0]).toHaveAttribute(
      'href',
      '/area-do-aluno/matematica-para-a-precisao',
    );
  });

  it('bloqueia a matrícula de cursos que ainda não abriram inscrições', async () => {
    renderCourse('comunicacao-tecnica-na-industria');

    expect(await screen.findByText('Disponível a partir de:')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Inscrições em breve' })[0]).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    expect(screen.queryByRole('link', { name: 'Matricule-se' })).not.toBeInTheDocument();
  });

  it('informa quando o curso não existe', async () => {
    renderCourse('curso-que-nao-existe');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Curso não encontrado' }),
    ).toBeInTheDocument();
  });
});
