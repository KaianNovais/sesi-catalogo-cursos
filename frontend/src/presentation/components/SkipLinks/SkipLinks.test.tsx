import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SkipLinks } from './SkipLinks';

describe('SkipLinks', () => {
  it('oferece os atalhos do eMAG com as teclas de acesso 1 a 4', () => {
    render(<SkipLinks targets={['content', 'menu', 'search', 'footer']} />);

    const expected = [
      ['Ir para o conteúdo [1]', '#conteudo', '1'],
      ['Ir para o menu [2]', '#menu-principal', '2'],
      ['Ir para a busca [3]', '#busca', '3'],
      ['Ir para o rodapé [4]', '#rodape', '4'],
    ];
    for (const [name, href, key] of expected) {
      const link = screen.getByRole('link', { name });
      expect(link).toHaveAttribute('href', href);
      expect(link).toHaveAttribute('accesskey', key);
    }
  });

  it('"Ir para o rodapé" leva o foco ao rodapé sem navegar pela âncora', async () => {
    const user = userEvent.setup();
    render(
      <>
        <SkipLinks targets={['footer']} />
        <footer id="rodape" tabIndex={-1}>
          Rodapé
        </footer>
      </>,
    );
    // Ouvinte no document: roda depois do onClick do React (delegado na raiz).
    let defaultPrevented = false;
    const onClick = (event: Event) => {
      defaultPrevented = event.defaultPrevented;
    };
    document.addEventListener('click', onClick);

    await user.click(screen.getByRole('link', { name: 'Ir para o rodapé [4]' }));
    document.removeEventListener('click', onClick);

    expect(screen.getByText('Rodapé')).toHaveFocus();
    expect(defaultPrevented).toBe(true);
  });

  it('"Ir para o menu" foca o botão do menu quando a lista está recolhida (celular)', async () => {
    const user = userEvent.setup();
    render(
      <>
        <SkipLinks targets={['menu']} />
        <button type="button" aria-controls="menu-principal">
          Abrir menu
        </button>
        <nav id="menu-principal">
          <a href="/cursos">Cursos</a>
        </nav>
      </>,
    );
    // O jsdom não calcula leiaute: simula a lista recolhida (sem caixas) e o botão visível.
    vi.spyOn(HTMLElement.prototype, 'getClientRects').mockImplementation(function (
      this: HTMLElement,
    ) {
      return (this.tagName === 'BUTTON' ? [new DOMRect()] : []) as unknown as DOMRectList;
    });

    await user.click(screen.getByRole('link', { name: 'Ir para o menu [2]' }));

    expect(screen.getByRole('button', { name: 'Abrir menu' })).toHaveFocus();
  });
});
