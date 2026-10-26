import { useEffect, useRef, type RefObject } from 'react';
import { Outlet, useLocation, useMatches, useNavigationType } from 'react-router';
import { SkipLinks } from '../components/SkipLinks/SkipLinks';
import { anchors } from '../routes/anchors';
import { Footer } from './Footer/Footer';
import { Header, type HeaderMode } from './Header/Header';
import styles from './SiteLayout.module.css';

export interface RouteHandle {
  header?: HeaderMode;
  /** A página tem o campo de busca (habilita o atalho "Ir para a busca"). */
  search?: boolean;
}

/**
 * Leva o foco ao conteúdo principal após cada navegação: leitores de tela
 * anunciam a nova página e o teclado não fica "perdido" no link clicado.
 * Vale também quando o layout é montado por um link vindo de outro layout (ex.: do AVA); no primeiro
 * carregamento da página (navegação "POP") o foco fica onde o navegador o deixa.
 */
function useFocusMainOnNavigation(mainRef: RefObject<HTMLElement | null>) {
  const { pathname } = useLocation();
  const arrivedByLink = useRef(useNavigationType() !== 'POP');
  const previousPathname = useRef<string | null>(null);

  useEffect(() => {
    const firstRender = previousPathname.current === null;
    const changed = previousPathname.current !== pathname;
    previousPathname.current = pathname;
    if (firstRender ? arrivedByLink.current : changed) {
      mainRef.current?.focus({ preventScroll: true });
    }
  }, [pathname, mainRef]);
}

export function SiteLayout() {
  const matches = useMatches();
  const handle = matches.at(-1)?.handle as RouteHandle | undefined;
  const mainRef = useRef<HTMLElement>(null);
  useFocusMainOnNavigation(mainRef);

  return (
    <>
      <SkipLinks
        targets={
          handle?.search ? ['content', 'menu', 'search', 'footer'] : ['content', 'menu', 'footer']
        }
      />
      <Header mode={handle?.header ?? 'sticky'} />
      <main id={anchors.content} ref={mainRef} tabIndex={-1} className={styles.main}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
