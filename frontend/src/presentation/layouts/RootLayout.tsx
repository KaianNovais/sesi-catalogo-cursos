import { Outlet, ScrollRestoration } from 'react-router';

/**
 * Raiz de todas as rotas (site e AVA). Um único ScrollRestoration, como recomenda o React Router:
 * cada navegação começa no topo da página (e "voltar" restaura a posição), inclusive ao trocar de
 * layout — sem isso, o AVA abria na altura em que a página do curso estava rolada.
 */
export function RootLayout() {
  return (
    <>
      <Outlet />
      <ScrollRestoration />
    </>
  );
}
