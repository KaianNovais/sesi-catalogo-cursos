/** Exibido apenas no primeiro carregamento, enquanto o código da rota é baixado. */
export function PageLoader() {
  return (
    <div
      role="status"
      style={{
        display: 'grid',
        placeItems: 'center',
        minHeight: '60vh',
        color: 'var(--color-text-muted)',
      }}
    >
      Carregando…
    </div>
  );
}
