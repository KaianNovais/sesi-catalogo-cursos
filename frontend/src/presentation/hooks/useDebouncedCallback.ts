import { useEffect, useRef } from 'react';

/**
 * Atrasa a execução de `callback` até o usuário parar de interagir por `delay` ms
 * (ex.: busca enquanto digita, sem uma requisição por tecla).
 */
export function useDebouncedCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delay: number,
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => () => clearTimeout(timerRef.current), []);

  function cancel() {
    clearTimeout(timerRef.current);
  }

  function run(...args: Args) {
    cancel();
    timerRef.current = setTimeout(() => callbackRef.current(...args), delay);
  }

  return { run, cancel };
}
