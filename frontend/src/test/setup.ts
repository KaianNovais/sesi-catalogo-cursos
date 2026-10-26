import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  cleanup();
});

// APIs de navegador ausentes no jsdom, usadas por hooks de layout/rolagem.
class ObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

vi.stubGlobal('ResizeObserver', ObserverStub);
vi.stubGlobal('IntersectionObserver', ObserverStub);

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }),
});

// <dialog>: o jsdom reflete o atributo "open", mas não implementa showModal() nem close().
HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
  this.open = true;
};
HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
  if (!this.open) return;
  this.open = false;
  this.dispatchEvent(new Event('close'));
};

window.scrollTo = () => {};
Element.prototype.scrollIntoView = () => {};
Element.prototype.scrollBy = () => {};
