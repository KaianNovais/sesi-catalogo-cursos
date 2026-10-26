import { useEffect, useId, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { Link } from 'react-router';
import { cx } from '@/shared/utils/cx';
import { TEXT_SIZES, type TextSize } from '../../accessibility/preferences';
import {
  activateLibras,
  deactivateLibras,
  resetPreferences,
  updatePreferences,
  useAccessibilityPreferences,
} from '../../accessibility/preferencesStore';
import { openVLibras, useVLibrasStatus } from '../../accessibility/vlibras';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { paths } from '../../routes/paths';
import { Button } from '../Button/Button';
import { Icon } from '../Icon/Icon';
import { IconButton } from '../IconButton/IconButton';
import styles from './AccessibilityMenu.module.css';

const TEXT_SIZE_LABELS: Record<TextSize, string> = {
  '100': 'Padrão',
  '125': 'Grande',
  '150': 'Muito grande',
};

interface ChoiceProps {
  name: string;
  checked: boolean;
  onSelect: () => void;
  sample: ReactNode;
  children: ReactNode;
}

/** Opção de um grupo de rádio exibida como cartão (a seta do teclado troca a opção). */
function Choice({ name, checked, onSelect, sample, children }: ChoiceProps) {
  return (
    <label className={cx(styles.choice, checked && styles.choiceChecked)}>
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onSelect}
        className="visually-hidden"
      />
      <span className={styles.sample} aria-hidden="true">
        {sample}
      </span>
      <span className={styles.choiceLabel}>{children}</span>
      {checked ? <Icon name="checkCircle" size={20} className={styles.choiceCheck} /> : null}
    </label>
  );
}

interface SwitchProps {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onToggle: (checked: boolean) => void;
}

/** Interruptor (checkbox nativo com papel "switch"): o nome é só o rótulo; a descrição vem à parte. */
function Switch({ label, description, checked, disabled = false, onToggle }: SwitchProps) {
  const id = useId();
  const descriptionId = `${id}-descricao`;
  return (
    <div className={styles.switch}>
      <input
        id={id}
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        aria-describedby={descriptionId}
        onChange={(event) => onToggle(event.target.checked)}
        className={styles.switchInput}
      />
      <div className={styles.switchText}>
        <label htmlFor={id} className={styles.switchLabel}>
          {label}
        </label>
        <span id={descriptionId} className={styles.switchDescription}>
          {description}
        </span>
      </div>
    </div>
  );
}

/**
 * Clique no fundo escurecido: o alvo é o próprio <dialog> e o ponteiro está fora da caixa dele.
 * Clicar na barra de rolagem da janela também tem o <dialog> como alvo, mas cai dentro da caixa.
 */
function isOnBackdrop(event: MouseEvent<HTMLDialogElement>): boolean {
  if (event.target !== event.currentTarget) return false;
  const box = event.currentTarget.getBoundingClientRect();
  return (
    event.clientX < box.left ||
    event.clientX > box.right ||
    event.clientY < box.top ||
    event.clientY > box.bottom
  );
}

const RESTORED_MESSAGE = 'Preferências restauradas para o padrão.';

interface AccessibilityPanelProps {
  onClose: () => void;
}

/** Painel de preferências de acessibilidade (janela modal nativa). */
export function AccessibilityPanel({ onClose }: AccessibilityPanelProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const groupName = useId();
  const preferences = useAccessibilityPreferences();
  const systemReducesMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const librasStatus = useVLibrasStatus();
  // "Ativado" só com o tradutor realmente pronto (a preferência salva pode estar carregando ou falhar).
  const librasActive = preferences.libras && librasStatus === 'ready';
  const [announcement, setAnnouncement] = useState('');
  const activateLibrasRef = useRef<HTMLButtonElement>(null);
  const pointerDownOnBackdrop = useRef(false);

  // Sem cleanup: ao desmontar, o <dialog> sai da página e fecha sozinho (e fechar no cleanup faria o
  // modo estrito do React disparar "close" logo após abrir).
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  // Fechar dispara o evento "close" do <dialog>, que avisa o botão (foco volta para ele).
  const close = () => dialogRef.current?.close();

  async function handleActivateLibras() {
    if (librasStatus === 'loading') return;
    // false: falhou (o estado "error" mostra o aviso) ou foi cancelada por "Desativar"/"Restaurar".
    if (!(await activateLibras())) return;
    // A janela modal deixa o resto da página inerte: fecha antes de abrir o avatar. Se o usuário
    // já fechou o painel durante o carregamento, só abre o avatar.
    if (dialogRef.current?.open) close();
    openVLibras();
  }

  function handleDeactivateLibras() {
    deactivateLibras();
    // O botão "Desativar" some: o foco vai para o "Ativar", que toma o lugar dele.
    requestAnimationFrame(() => activateLibrasRef.current?.focus());
  }

  function restoreDefaults() {
    resetPreferences();
    // Texto diferente a cada vez (espaço invisível no fim) para o leitor de tela anunciar de novo.
    setAnnouncement((previous) =>
      previous === RESTORED_MESSAGE ? `${RESTORED_MESSAGE}\u00a0` : RESTORED_MESSAGE,
    );
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className={styles.dialog}
      onClose={onClose}
      // Só fecha se o clique começou e terminou no fundo: arrastar uma seleção de texto de dentro
      // para fora gera um "click" com o próprio <dialog> como alvo.
      onPointerDown={(event) => {
        pointerDownOnBackdrop.current = isOnBackdrop(event);
      }}
      onClick={(event) => {
        if (pointerDownOnBackdrop.current && isOnBackdrop(event)) close();
        pointerDownOnBackdrop.current = false;
      }}
    >
      <div className={styles.content}>
        <div className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            Acessibilidade
          </h2>
          <IconButton icon="close" label="Fechar" onClick={close} className={styles.closeButton} />
        </div>
        <p className={styles.intro}>
          Ajuste o site ao seu jeito. As escolhas ficam salvas neste navegador.
        </p>

        <fieldset className={styles.group}>
          <legend className={styles.legend}>Tamanho do texto</legend>
          <div className={styles.choices}>
            {TEXT_SIZES.map((size) => (
              <Choice
                key={size}
                name={`${groupName}-tamanho`}
                checked={preferences.textSize === size}
                onSelect={() => updatePreferences({ textSize: size })}
                sample={<span className={styles[`sampleText${size}`]}>A</span>}
              >
                {TEXT_SIZE_LABELS[size]} <span className={styles.choiceHint}>{size}%</span>
              </Choice>
            ))}
          </div>
          <p className={styles.groupHint}>
            Para ampliar ainda mais, use o zoom do navegador (Ctrl e +, ou Cmd e + no Mac).
          </p>
        </fieldset>

        <fieldset className={styles.group}>
          <legend className={styles.legend}>Contraste</legend>
          <div className={styles.choices}>
            <Choice
              name={`${groupName}-contraste`}
              checked={!preferences.highContrast}
              onSelect={() => updatePreferences({ highContrast: false })}
              sample={<span className={styles.sampleContrastDefault} />}
            >
              Padrão
            </Choice>
            <Choice
              name={`${groupName}-contraste`}
              checked={preferences.highContrast}
              onSelect={() => updatePreferences({ highContrast: true })}
              sample={<span className={styles.sampleContrastHigh} />}
            >
              Alto contraste
            </Choice>
          </div>
        </fieldset>

        <fieldset className={styles.group}>
          <legend className={styles.legend}>Leitura e navegação</legend>
          <Switch
            label="Espaçamento ampliado"
            description="Mais espaço entre letras, palavras e linhas."
            checked={preferences.wideSpacing}
            onToggle={(checked) => updatePreferences({ wideSpacing: checked })}
          />
          <Switch
            label="Destacar links"
            description="Sublinha todos os links da página."
            checked={preferences.underlineLinks}
            onToggle={(checked) => updatePreferences({ underlineLinks: checked })}
          />
          <Switch
            label="Reduzir animações"
            description={
              systemReducesMotion
                ? 'Já ativado pelas configurações do seu dispositivo.'
                : 'Desliga transições, movimentos e a rolagem suave.'
            }
            checked={systemReducesMotion || preferences.reduceMotion}
            disabled={systemReducesMotion}
            onToggle={(checked) => updatePreferences({ reduceMotion: checked })}
          />
        </fieldset>

        <fieldset className={styles.group}>
          <legend className={styles.legend}>Libras</legend>
          <p className={styles.groupText}>
            Tradução dos textos do site para a Língua Brasileira de Sinais pelo VLibras, serviço
            gratuito do Governo Federal. Ao ativar, o tradutor é carregado de vlibras.gov.br.
          </p>
          {librasActive ? (
            <div className={styles.librasActive}>
              <p className={styles.groupText}>
                <strong>Ativado.</strong> Use o botão do VLibras na lateral direita da tela.
              </p>
              <Button variant="outline" onClick={handleDeactivateLibras}>
                Desativar tradutor
              </Button>
            </div>
          ) : (
            <Button
              ref={activateLibrasRef}
              variant="dark"
              // aria-disabled (e não disabled) mantém o foco no botão enquanto carrega.
              aria-disabled={librasStatus === 'loading'}
              onClick={handleActivateLibras}
            >
              {librasStatus === 'loading'
                ? 'Carregando o VLibras…'
                : librasStatus === 'error'
                  ? 'Tentar novamente'
                  : 'Ativar tradutor de Libras'}
            </Button>
          )}
          {librasStatus === 'error' ? (
            <p role="alert" className={styles.error}>
              Não foi possível carregar o VLibras. Verifique sua conexão e tente novamente.
            </p>
          ) : null}
        </fieldset>

        <div className={styles.footer}>
          <Button variant="outline" onClick={restoreDefaults}>
            Restaurar padrões
          </Button>
          <Link to={paths.accessibility} className={styles.moreLink} onClick={close}>
            Recursos e atalhos de teclado
          </Link>
        </div>
        <p role="status" className="visually-hidden">
          {announcement}
        </p>
      </div>
    </dialog>
  );
}
