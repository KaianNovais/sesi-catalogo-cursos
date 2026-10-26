import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Accordion, AccordionItem } from './Accordion';

describe('Accordion', () => {
  it('expande e recolhe o painel, mantendo os atributos ARIA', async () => {
    const user = userEvent.setup();
    render(
      <Accordion>
        <AccordionItem title="Módulos">Conteúdo dos módulos</AccordionItem>
      </Accordion>,
    );

    const trigger = screen.getByRole('button', { name: 'Módulos' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('region', { name: 'Módulos' })).not.toBeInTheDocument();

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('region', { name: 'Módulos' })).toHaveTextContent(
      'Conteúdo dos módulos',
    );

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
});
