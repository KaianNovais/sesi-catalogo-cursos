import { logoPaths } from './logoPaths';

interface LogoProps {
  /** "full": SESI + INDÚSTRIA (cabeçalho/rodapé); "sesi": selo reduzido. */
  variant?: keyof typeof logoPaths;
  className?: string;
  /** Rótulo acessível. Omitir quando o texto já estiver no elemento pai (ex.: link). */
  title?: string;
}

export function Logo({ variant = 'full', className, title }: LogoProps) {
  const { viewBox, paths } = logoPaths[variant];
  const [, , width, height] = viewBox.split(' ').map(Number);

  return (
    <svg
      viewBox={viewBox}
      width={width}
      height={height}
      fill="currentColor"
      className={className}
      focusable="false"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
    >
      {title ? <title>{title}</title> : null}
      {paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
