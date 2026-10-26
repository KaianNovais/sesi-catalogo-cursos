import { useSyncExternalStore } from 'react';

/**
 * VLibras: tradutor de Português para Libras do Governo Federal (gratuito, vlibras.gov.br).
 * O script oficial só é baixado quando o usuário ativa a opção no menu "Acessibilidade", para não
 * pesar no carregamento nem enviar requisições a terceiros sem necessidade.
 *
 * O script cria o botão flutuante (#vlibras-access-wrapper) e, ao abrir, a janela do avatar
 * (#vlibras-app-root). Para desativar sem recarregar, o CSS global esconde os dois quando o <html>
 * tem data-libras="off".
 */
const SCRIPT_URL = 'https://vlibras.gov.br/app/vlibras-plugin.js';

/** Estado real do tradutor (a preferência salva diz só o que o usuário escolheu). */
export type VLibrasStatus = 'idle' | 'loading' | 'ready' | 'error';

interface VLibrasWidget {
  open: () => void;
}

declare global {
  interface Window {
    VLibrasWidget?: VLibrasWidget;
  }
}

let scriptLoading: Promise<void> | undefined;
let status: VLibrasStatus = 'idle';
/** Cada ativação recebe um número; desativar (ou restaurar o padrão) invalida as que ainda carregam. */
let currentRequest = 0;
const listeners = new Set<() => void>();

function setStatus(next: VLibrasStatus) {
  status = next;
  listeners.forEach((listener) => listener());
}

function loadScript(): Promise<void> {
  scriptLoading ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      // Permite tentar de novo (ex.: a conexão voltou).
      scriptLoading = undefined;
      script.remove();
      reject(new Error('Não foi possível carregar o VLibras.'));
    };
    document.body.append(script);
  });
  return scriptLoading;
}

function widgetReady(): boolean {
  return typeof window.VLibrasWidget?.open === 'function';
}

/**
 * O script monta window.VLibrasWidget em etapas: o objeto aparece antes do método open(). Espera
 * (até 10 s) o widget ficar pronto.
 */
function waitForWidget(): Promise<void> {
  const deadline = Date.now() + 10_000;
  return new Promise((resolve, reject) => {
    const check = () => {
      if (widgetReady()) resolve();
      else if (Date.now() > deadline) reject(new Error('O VLibras não respondeu.'));
      else setTimeout(check, 100);
    };
    check();
  });
}

/** Fecha o avatar e esconde o botão (inclusive o que o script ainda montar depois). */
function hide() {
  const app = document.getElementById('vlibras-app-root');
  if (app) app.dataset.active = 'false';
  document.documentElement.dataset.libras = 'off';
}

export function getVLibrasStatus(): VLibrasStatus {
  return status;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useVLibrasStatus(): VLibrasStatus {
  return useSyncExternalStore(subscribe, getVLibrasStatus, () => 'idle');
}

/**
 * Exibe o botão do VLibras, baixando o script na primeira vez. Resolve `true` se o tradutor ficou
 * pronto e a ativação ainda vale; `false` se falhou (estado "error") ou foi cancelada no caminho.
 */
export async function enableVLibras(): Promise<boolean> {
  const request = ++currentRequest;
  setStatus('loading');
  document.documentElement.removeAttribute('data-libras');
  try {
    await loadScript();
    await waitForWidget();
  } catch {
    if (request === currentRequest) {
      hide();
      setStatus('error');
    }
    return false;
  }
  if (request !== currentRequest) return false;
  setStatus('ready');
  return true;
}

/** Abre a janela do avatar (com o tradutor pronto). */
export function openVLibras(): void {
  if (status === 'ready' && widgetReady()) window.VLibrasWidget?.open();
}

/** Fecha o avatar, esconde o botão e cancela uma ativação em andamento (o script fica em cache). */
export function disableVLibras(): void {
  currentRequest += 1;
  hide();
  setStatus('idle');
}
