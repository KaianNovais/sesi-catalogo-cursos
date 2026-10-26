import type { SVGProps } from 'react';
import { icons, type IconDefinition, type IconName } from './icons';

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'children' | 'name'> {
  name: IconName;
  size?: number | string;
  /** Texto alternativo. Sem ele, o ícone é decorativo (oculto de leitores de tela). */
  title?: string;
}

export function Icon({ name, size = 24, title, ...rest }: IconProps) {
  const definition: IconDefinition = icons[name];

  return (
    <svg
      viewBox={definition.viewBox}
      width={size}
      height={size}
      fill="currentColor"
      focusable="false"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {definition.paths.map((path) => (
        <path key={path.d} d={path.d} fillRule={path.fillRule} opacity={path.opacity} />
      ))}
    </svg>
  );
}

export type { IconName };
