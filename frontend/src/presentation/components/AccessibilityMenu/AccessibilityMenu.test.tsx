import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { renderWithProviders } from '@/test/renderWithProviders';
import { PREFERENCES_STORAGE_KEY } from '../../accessibility/preferences';
import { resetPreferences } from '../../accessibility/preferencesStore';
import { AccessibilityMenu } from './AccessibilityMenu';

afterEach(() => {
  resetPreferences();
});

async function openMenu() {
  const user = userEvent.setup();
  renderWithProviders(<AccessibilityMenu />);
  await user.click(screen.getByRole('button', { name: 'Acessibilidade' }));
  const dialog = await screen.findByRole('dialog', { name: 'Acessibilidade' });
  return { user, dialog };
}

function savedPreferences(): unknown {
  return JSON.parse(window.localStorage.getItem(PREFERENCES_STORAGE_KEY) ?? 'null');
}

describe('AccessibilityMenu', () => {
  it('amplia o texto da página e salva a escolha', async () => {
    const { user, dialog } = await openMenu();

    await user.click(within(dialog).getByRole('radio', { name: /Muito grande/ }));

    expect(within(dialog).getByRole('radio', { name: /Muito grande/ })).toBeChecked();
    expect(document.documentElement).toHaveAttribute('data-text-size', '150');
    expect(savedPreferences()).toMatchObject({ textSize: '150' });
  });

  it('liga o alto contraste e os ajustes de leitura', async () => {
    const { user, dialog } = await openMenu();

    await user.click(within(dialog).getByRole('radio', { name: 'Alto contraste' }));
    await user.click(within(dialog).getByRole('switch', { name: 'Espaçamento ampliado' }));
    await user.click(within(dialog).getByRole('switch', { name: 'Destacar links' }));
    await user.click(within(dialog).getByRole('switch', { name: 'Reduzir animações' }));

    const root = document.documentElement;
    expect(root).toHaveAttribute('data-contrast', 'high');
    expect(root).toHaveAttribute('data-text-spacing', 'wide');
    expect(root).toHaveAttribute('data-links', 'underline');
    expect(root).toHaveAttribute('data-motion', 'reduce');
    expect(
      within(dialog).getByRole('switch', { name: 'Espaçamento ampliado' }),
    ).toHaveAccessibleDescription('Mais espaço entre letras, palavras e linhas.');
  });

  it('restaura o padrão e anuncia a mudança', async () => {
    const { user, dialog } = await openMenu();
    await user.click(within(dialog).getByRole('radio', { name: /Grande 125%/ }));
    await user.click(within(dialog).getByRole('radio', { name: 'Alto contraste' }));

    await user.click(within(dialog).getByRole('button', { name: 'Restaurar padrões' }));

    expect(document.documentElement).not.toHaveAttribute('data-text-size');
    expect(document.documentElement).not.toHaveAttribute('data-contrast');
    expect(savedPreferences()).toBeNull();
    expect(within(dialog).getByRole('status')).toHaveTextContent('Preferências restauradas');
  });

  it('fecha pelo botão "Fechar" e devolve o foco ao botão "Acessibilidade"', async () => {
    const { user, dialog } = await openMenu();

    await user.click(within(dialog).getByRole('button', { name: 'Fechar' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Acessibilidade' })).toHaveFocus();
  });
});
