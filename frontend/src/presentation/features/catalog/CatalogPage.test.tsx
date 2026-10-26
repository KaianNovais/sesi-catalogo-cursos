import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { createInMemoryCourseRepository } from '@/infrastructure/course/inMemoryCourseRepository';
import { renderWithProviders } from '@/test/renderWithProviders';
import { CatalogPage } from './CatalogPage';

/** Encontra a região "status" (lida por leitores de tela) com a quantidade de resultados. */
function findCount(text: RegExp | string) {
  return screen.findByText(
    (_, element) =>
      element?.getAttribute('role') === 'status' && Boolean(element.textContent?.match(text)),
  );
}

describe('CatalogPage', () => {
  it('exibe o carregamento e depois lista os cursos da API com a quantidade', async () => {
    renderWithProviders(<CatalogPage />, { route: '/cursos' });

    expect(screen.getByText('Carregando cursos…')).toBeInTheDocument();
    expect(await findCount('8 cursos encontrados')).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(8);
  });

  it('dá prioridade só à foto do primeiro card (LCP); as demais usam lazy loading', async () => {
    const { container } = renderWithProviders(<CatalogPage />, { route: '/cursos' });
    await findCount('8 cursos encontrados');

    // As fotos são decorativas (alt=""), sem papel acessível: a consulta é pelo DOM.
    const [first, ...others] = container.querySelectorAll('article img');
    expect(first).toHaveAttribute('loading', 'eager');
    expect(first).toHaveAttribute('fetchpriority', 'high');
    expect(others).toHaveLength(7);
    for (const image of others) {
      expect(image).toHaveAttribute('loading', 'lazy');
      expect(image).not.toHaveAttribute('fetchpriority');
    }
  });

  it('pesquisa pelo nome (sem acentos) e combina com filtros', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CatalogPage />, { route: '/cursos' });
    await findCount('8 cursos encontrados');

    await user.type(screen.getByLabelText('Buscar pelo nome'), 'metalurgia');
    expect(await findCount(/^3 cursos encontrados/)).toBeInTheDocument();

    await waitFor(() => expect(screen.getByLabelText('Categoria')).toBeEnabled());
    await user.selectOptions(screen.getByLabelText('Categoria'), 'ciencias-da-natureza');
    expect(await findCount(/^2 cursos encontrados/)).toBeInTheDocument();

    const titles = screen
      .getAllByRole('heading', { level: 3 })
      .map((heading) => heading.textContent);
    expect(titles).toEqual([
      'Física do Movimento e da Energia na Metalurgia',
      'Ciência dos Materiais na Metalurgia',
    ]);
  });

  it('mostra mensagem quando nenhum curso é encontrado e permite limpar os filtros', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CatalogPage />, { route: '/cursos?busca=inexistente&status=encerrado' });

    expect(
      await screen.findByRole('heading', { name: 'Nenhum curso encontrado' }),
    ).toBeInTheDocument();

    const emptyState = screen.getByRole('heading', { name: 'Nenhum curso encontrado' })
      .parentElement as HTMLElement;
    await user.click(within(emptyState).getByRole('button', { name: 'Limpar filtros' }));

    expect(await findCount('8 cursos encontrados')).toBeInTheDocument();
    expect(screen.getByLabelText('Buscar pelo nome')).toHaveValue('');
    expect(screen.getByLabelText('Status')).toHaveValue('');
  });

  it('no celular, recolhe os filtros num botão que informa quantos estão ativos', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CatalogPage />, { route: '/cursos?categoria=matematica&status=em-breve' });
    await findCount(/curso/);

    const toggle = screen.getByRole('button', { name: 'Filtros (2 ativos)' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(document.getElementById(toggle.getAttribute('aria-controls') ?? '')).toHaveAttribute(
      'data-open',
      'true',
    );
  });

  it('mostra mensagem de erro e permite tentar novamente', async () => {
    const user = userEvent.setup();
    let failing = true;
    const repository = createInMemoryCourseRepository({ shouldFail: () => failing });
    renderWithProviders(<CatalogPage />, { route: '/cursos', repository });

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Não foi possível carregar os cursos');

    failing = false;
    await user.click(within(alert).getByRole('button', { name: 'Tentar novamente' }));
    expect(await findCount('8 cursos encontrados')).toBeInTheDocument();
  });
});
