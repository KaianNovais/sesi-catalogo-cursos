import { useEffect, useRef, useState } from 'react';
import { cx } from '@/shared/utils/cx';
import { IconButton } from '../IconButton/IconButton';
import styles from './AccessibilityMenu.module.css';

type Panel = typeof import('./AccessibilityPanel').AccessibilityPanel;

// O painel só é baixado quando alguém o abre (ou aponta/foca o botão): não pesa no carregamento.
const loadPanel = () => import('./AccessibilityPanel');

function preloadPanel() {
  loadPanel().catch(() => {
    // Falha no prefetch não é crítica: abrir o menu tenta carregar de novo.
  });
}

interface AccessibilityMenuProps {
  className?: string;
}

/** Botão "Acessibilidade" que abre o painel de preferências (cabeçalho do site e AVA). */
export function AccessibilityMenu({ className }: AccessibilityMenuProps) {
  const [panel, setPanel] = useState<Panel | null>(null);
  const [open, setOpen] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // O aviso de falha some sozinho depois de alguns segundos.
  useEffect(() => {
    if (!loadFailed) return;
    const timer = setTimeout(() => setLoadFailed(false), 8000);
    return () => clearTimeout(timer);
  }, [loadFailed]);

  // Carrega no clique (e não com lazy + Suspense): uma falha de rede vira um aviso aqui, em vez de
  // derrubar a página inteira no limite de erro da rota.
  async function openPanel() {
    setLoadFailed(false);
    try {
      const { AccessibilityPanel } = await loadPanel();
      setPanel(() => AccessibilityPanel);
      setOpen(true);
    } catch {
      setLoadFailed(true);
    }
  }

  function close() {
    setOpen(false);
    buttonRef.current?.focus();
  }

  const PanelComponent = open ? panel : null;

  return (
    <>
      <IconButton
        ref={buttonRef}
        icon="accessibility"
        label="Acessibilidade"
        aria-haspopup="dialog"
        className={cx(styles.trigger, className)}
        onClick={openPanel}
        onPointerEnter={preloadPanel}
        onFocus={preloadPanel}
      />
      {loadFailed ? (
        <p role="alert" className={styles.loadError}>
          Não foi possível abrir as opções de acessibilidade. Verifique sua conexão, recarregue a
          página e tente de novo.
        </p>
      ) : null}
      {PanelComponent ? <PanelComponent onClose={close} /> : null}
    </>
  );
}
