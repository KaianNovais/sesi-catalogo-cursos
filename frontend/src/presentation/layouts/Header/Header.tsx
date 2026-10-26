import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { cx } from '@/shared/utils/cx';
import { AccessibilityMenu } from '../../components/AccessibilityMenu/AccessibilityMenu';
import { ButtonLink } from '../../components/Button/Button';
import { IconButton } from '../../components/IconButton/IconButton';
import { Logo } from '../../components/Logo/Logo';
import { mainNavigation, site } from '../../content/site';
import { useScrolledPast } from '../../hooks/useScrolledPast';
import { anchors } from '../../routes/anchors';
import { paths } from '../../routes/paths';
import { preloadOnIntent } from '../../routes/routeModules';
import styles from './Header.module.css';

export type HeaderMode = 'overlay' | 'sticky' | 'static';

interface HeaderProps {
  /**
   * overlay: fixo e transparente sobre o hero, fica branco ao rolar (página inicial);
   * sticky: branco e fixo no topo; static: branco e rola com a página (detalhes do curso).
   */
  mode: HeaderMode;
}

const MENU_ID = anchors.menu;

export function Header({ mode }: HeaderProps) {
  const location = useLocation();
  const scrolled = useScrolledPast(16);
  const [menuOpen, setMenuOpen] = useState(false);

  // Fecha o menu móvel ao navegar (ajuste de estado durante a renderização).
  const locationKey = `${location.pathname}${location.hash}`;
  const [lastLocationKey, setLastLocationKey] = useState(locationKey);
  if (locationKey !== lastLocationKey) {
    setLastLocationKey(locationKey);
    setMenuOpen(false);
  }

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      // Esc dentro de uma janela modal (ex.: painel de acessibilidade) fecha só a janela.
      if (event.target instanceof Element && event.target.closest('dialog')) return;
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [menuOpen]);

  // Também fecha ao clicar em um link da página atual (a URL não muda nesse caso).
  const closeMenu = () => setMenuOpen(false);
  const transparent = mode === 'overlay' && !scrolled && !menuOpen;

  return (
    <header
      className={cx(
        styles.header,
        styles[mode],
        transparent ? styles.transparent : styles.solid,
        menuOpen && styles.menuOpen,
      )}
    >
      <div className={cx('container', styles.bar)}>
        <Link to={paths.home} className={styles.logo} aria-label={`${site.name} — página inicial`}>
          <Logo />
        </Link>

        {/* Fora do menu recolhível: sempre visível, inclusive no celular */}
        <AccessibilityMenu className={styles.accessibility} />

        <IconButton
          icon={menuOpen ? 'close' : 'menu'}
          label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={menuOpen}
          aria-controls={MENU_ID}
          className={styles.menuButton}
          onClick={() => setMenuOpen((open) => !open)}
        />

        <nav id={MENU_ID} aria-label="Principal" className={styles.nav}>
          <ul role="list" className={styles.links}>
            {mainNavigation.map((item) => (
              <li key={item.label}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={styles.link}
                  onClick={closeMenu}
                  {...(item.to === paths.catalog ? preloadOnIntent('catalog') : undefined)}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
            <li>
              <Link to={paths.about} className={styles.link} onClick={closeMenu}>
                Sobre
              </Link>
            </li>
          </ul>
          <ButtonLink
            to={paths.studentArea}
            variant={transparent ? 'outline-light' : 'outline'}
            size="lg"
            onClick={closeMenu}
            {...preloadOnIntent('learning')}
          >
            Área do aluno
          </ButtonLink>
        </nav>
      </div>
    </header>
  );
}
