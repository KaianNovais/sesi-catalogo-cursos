import { cx } from '@/shared/utils/cx';
import { Icon } from '../../components/Icon/Icon';
import { site } from '../../content/site';
import styles from './AccessibilityPage.module.css';

const MENU_OPTIONS = [
  {
    title: 'Tamanho do texto',
    text: '100%, 125% ou 150%. Para ampliar mais, use o zoom do navegador: o site funciona até 400% sem rolagem horizontal.',
  },
  { title: 'Alto contraste', text: 'Fundo preto, texto branco e links amarelos.' },
  {
    title: 'Espaçamento ampliado',
    text: 'Mais espaço entre letras, palavras e linhas (valores recomendados pela WCAG).',
  },
  { title: 'Destacar links', text: 'Sublinha todos os links da página.' },
  {
    title: 'Reduzir animações',
    text: 'Desliga transições e a rolagem suave. A mesma preferência, quando vem do sistema, já é respeitada.',
  },
  {
    title: 'Libras',
    text: 'Tradução dos textos para a Língua Brasileira de Sinais pelo VLibras, do Governo Federal.',
  },
] as const;

const SHORTCUTS = [
  { key: '1', target: 'Conteúdo principal' },
  { key: '2', target: 'Menu de navegação' },
  { key: '3', target: 'Busca de cursos (página "Cursos")' },
  { key: '4', target: 'Rodapé' },
] as const;

const NEEDS = [
  {
    title: 'Baixa visão',
    text: 'Texto ampliável, zoom de até 400% sem perda de conteúdo, alto contraste, compatibilidade com o modo de alto contraste do Windows e contraste mínimo de 4,5:1 nos textos.',
  },
  {
    title: 'Pessoas cegas (leitores de tela)',
    text: 'Títulos e regiões bem definidos, textos alternativos nas imagens, nomes em todos os botões e anúncio do número de resultados e de cada troca de página.',
  },
  {
    title: 'Pessoas surdas',
    text: 'Tradução para Libras pelo VLibras. Quando houver vídeos, eles terão legendas e transcrição.',
  },
  {
    title: 'Mobilidade reduzida',
    text: 'Tudo funciona pelo teclado, com o foco sempre visível e nunca escondido pelas barras fixas. As áreas de toque têm pelo menos 24 × 24 px e nenhum recurso exige arrastar.',
  },
  {
    title: 'Dislexia, TDAH e outras condições cognitivas',
    text: 'Espaçamento ampliado, links destacados, animações que podem ser desligadas, linguagem direta e navegação igual em todas as páginas.',
  },
  {
    title: 'Sensibilidade a movimento',
    text: 'Nada pisca na tela e as animações podem ser desligadas.',
  },
] as const;

/** Declaração de acessibilidade: recursos, atalhos, como verificamos e como reportar barreiras. */
export function AccessibilityPage() {
  return (
    <div className={cx('container', styles.page)}>
      <title>Acessibilidade | SESI Indústria</title>

      <header className={styles.intro}>
        <h1 className={styles.title}>Acessibilidade</h1>
        <p className={styles.lead}>
          Queremos que todas as pessoas consigam encontrar e fazer os nossos cursos, inclusive quem
          usa leitor de tela, navega pelo teclado, amplia a tela ou se comunica em Libras. O site
          segue as Diretrizes de Acessibilidade para Conteúdo Web (WCAG 2.2, nível AA) e as
          recomendações do eMAG, o modelo de acessibilidade do Governo Federal.
        </p>
      </header>

      <section className={styles.section} aria-labelledby="menu-acessibilidade">
        <h2 id="menu-acessibilidade" className={styles.heading}>
          Menu de acessibilidade
        </h2>
        <p>
          O botão com o símbolo de acessibilidade{' '}
          <Icon name="accessibility" size={20} className={styles.inlineIcon} />, no topo de todas as
          páginas e no menu da área do aluno, abre as opções abaixo. As escolhas ficam salvas no seu
          navegador.
        </p>
        <dl className={styles.list}>
          {MENU_OPTIONS.map((option) => (
            <div key={option.title} className={styles.listItem}>
              <dt className={styles.term}>{option.title}</dt>
              <dd>{option.text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={styles.section} aria-labelledby="atalhos">
        <h2 id="atalhos" className={styles.heading}>
          Atalhos de teclado
        </h2>
        <p>
          Os atalhos seguem o padrão do eMAG. Ao navegar com Tab a partir do início da página, eles
          também aparecem como links no canto superior.
        </p>
        <table className={styles.table}>
          <caption className="visually-hidden">Atalhos de teclado e destinos</caption>
          <thead>
            <tr>
              <th scope="col">Número</th>
              <th scope="col">Leva para</th>
            </tr>
          </thead>
          <tbody>
            {SHORTCUTS.map((shortcut) => (
              <tr key={shortcut.key}>
                <td>
                  <kbd>{shortcut.key}</kbd>
                </td>
                <td>{shortcut.target}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          Como acionar: <kbd>Alt</kbd> + número no Chrome e no Edge (Windows); <kbd>Alt</kbd> +{' '}
          <kbd>Shift</kbd> + número no Firefox; <kbd>Control</kbd> + <kbd>Option</kbd> + número no
          Safari e no Chrome do Mac.
        </p>
        <p>
          No restante do site: <kbd>Tab</kbd> e <kbd>Shift</kbd> + <kbd>Tab</kbd> percorrem links,
          botões e campos; <kbd>Enter</kbd> ativa links e botões; <kbd>Espaço</kbd> marca opções; as
          setas trocam a opção dentro de um grupo; <kbd>Esc</kbd> fecha o menu e as janelas.
        </p>
      </section>

      <section className={styles.section} aria-labelledby="necessidades">
        <h2 id="necessidades" className={styles.heading}>
          O que fizemos para cada necessidade
        </h2>
        <dl className={styles.list}>
          {NEEDS.map((need) => (
            <div key={need.title} className={styles.listItem}>
              <dt className={styles.term}>{need.title}</dt>
              <dd>{need.text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={styles.section} aria-labelledby="verificacao">
        <h2 id="verificacao" className={styles.heading}>
          Como verificamos
        </h2>
        <ul className={styles.bullets}>
          <li>
            Lighthouse (que usa o axe-core) com nota 100 em acessibilidade nas páginas principais.
          </li>
          <li>Navegação completa pelo teclado, conferindo a ordem e a visibilidade do foco.</li>
          <li>
            Telas de 320 px (equivalente ao zoom de 400%), texto a 150% e espaçamento da WCAG sem
            perda de conteúdo nem rolagem horizontal.
          </li>
          <li>Modo de alto contraste do Windows (cores forçadas) simulado no navegador.</li>
          <li>Contraste medido nas combinações de texto e fundo do site.</li>
        </ul>
      </section>

      <section className={styles.section} aria-labelledby="limitacoes">
        <h2 id="limitacoes" className={styles.heading}>
          Limitações conhecidas
        </h2>
        <ul className={styles.bullets}>
          <li>
            Ainda não houve testes com pessoas com deficiência nem com todos os leitores de tela; as
            verificações acima foram automáticas e manuais.
          </li>
          <li>
            O VLibras é um serviço externo do Governo Federal: ele só é carregado quando você o
            ativa e, a partir daí, recebe os textos da página para traduzi-los.
          </li>
        </ul>
      </section>

      <section className={styles.section} aria-labelledby="barreiras">
        <h2 id="barreiras" className={styles.heading}>
          Encontrou alguma barreira?
        </h2>
        <p>
          Conte para a gente pelo e-mail <a href={`mailto:${site.email}`}>{site.email}</a>,
          informando o endereço da página e o que aconteceu. Sua mensagem nos ajuda a melhorar.
        </p>
      </section>

      <p className={styles.updated}>Última revisão: 24 de outubro de 2026.</p>
    </div>
  );
}
