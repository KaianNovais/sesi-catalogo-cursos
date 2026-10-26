import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type VLibrasModule = typeof import('./vlibras');
let vlibras: VLibrasModule;

// O jsdom não baixa scripts externos: os testes disparam o "load"/"error" do script oficial.
function script() {
  return document.querySelector('script[src*="vlibras"]');
}

function finishScriptLoad() {
  window.VLibrasWidget = { open: vi.fn() };
  script()?.dispatchEvent(new Event('load'));
}

beforeEach(async () => {
  // Módulo novo a cada teste: script em cache e estado não passam de um teste para outro.
  vi.resetModules();
  vlibras = await import('./vlibras');
});

afterEach(() => {
  vi.useRealTimers();
  document.querySelectorAll('script[src*="vlibras"]').forEach((element) => element.remove());
  delete window.VLibrasWidget;
  document.documentElement.removeAttribute('data-libras');
});

describe('VLibras', () => {
  it('fica pronto e mostra o botão quando o script carrega', async () => {
    const activation = vlibras.enableVLibras();
    expect(vlibras.getVLibrasStatus()).toBe('loading');

    finishScriptLoad();

    await expect(activation).resolves.toBe(true);
    expect(vlibras.getVLibrasStatus()).toBe('ready');
    expect(document.documentElement).not.toHaveAttribute('data-libras');
  });

  it('ignora a ativação desativada enquanto o script carregava', async () => {
    const activation = vlibras.enableVLibras();

    vlibras.disableVLibras();
    finishScriptLoad();

    await expect(activation).resolves.toBe(false);
    expect(vlibras.getVLibrasStatus()).toBe('idle');
    expect(document.documentElement).toHaveAttribute('data-libras', 'off');
  });

  it('mostra erro e permite tentar de novo quando o script não carrega', async () => {
    const activation = vlibras.enableVLibras();

    script()?.dispatchEvent(new Event('error'));

    await expect(activation).resolves.toBe(false);
    expect(vlibras.getVLibrasStatus()).toBe('error');
    expect(document.documentElement).toHaveAttribute('data-libras', 'off');
    // O script com falha sai da página: a próxima tentativa cria outro.
    expect(script()).toBeNull();
    const retry = vlibras.enableVLibras();
    expect(script()).not.toBeNull();
    finishScriptLoad();
    await expect(retry).resolves.toBe(true);
  });

  it('desiste após 10 s se o widget não ficar pronto', async () => {
    vi.useFakeTimers();
    const activation = vlibras.enableVLibras();

    script()?.dispatchEvent(new Event('load')); // script carregou, mas o widget não apareceu
    await vi.advanceTimersByTimeAsync(10_200);

    await expect(activation).resolves.toBe(false);
    expect(vlibras.getVLibrasStatus()).toBe('error');
    expect(document.documentElement).toHaveAttribute('data-libras', 'off');
  });
});
