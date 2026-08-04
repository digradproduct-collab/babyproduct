import type { Category } from "@/generated/prisma/client";

/**
 * Jeu d'icônes dessiné à la main, grille 24×24, trait unique de 1.5.
 * Remplace les emoji : une famille cohérente en épaisseur et en optique,
 * qui hérite de la couleur du texte et reste nette à toute taille.
 */

type IconProps = {
  className?: string;
  strokeWidth?: number;
};

function Svg({
  children,
  className,
  strokeWidth = 1.5,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
}

export function MoonIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M20 14.2A8.2 8.2 0 0 1 9.8 4a8.4 8.4 0 1 0 10.2 10.2Z" />
    </Svg>
  );
}

export function ShieldIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 3 5 6v5.5c0 4.2 2.9 7.6 7 9.5 4.1-1.9 7-5.3 7-9.5V6l-7-3Z" />
      <path d="m9.2 12 2 2 3.6-3.8" />
    </Svg>
  );
}

export function BlocksIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="3.5" y="12.5" width="8" height="8" rx="1.6" />
      <rect x="12.5" y="12.5" width="8" height="8" rx="1.6" />
      <rect x="8" y="3.5" width="8" height="8" rx="1.6" />
    </Svg>
  );
}

export function RainbowIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M3 18a9 9 0 0 1 18 0" />
      <path d="M6.5 18a5.5 5.5 0 0 1 11 0" />
      <path d="M10 18a2 2 0 0 1 4 0" />
    </Svg>
  );
}

export function TreeIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 3 6.5 11h3L5 17h14l-4.5-6h3L12 3Z" />
      <path d="M12 17v4" />
    </Svg>
  );
}

export function RabbitIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M8.5 9.5c-.8-2.2-1-4.2-.4-5.4.7-1.3 1.9-.7 2.4.8.3 1 .5 2.4.5 3.6" />
      <path d="M15.5 9.5c.8-2.2 1-4.2.4-5.4-.7-1.3-1.9-.7-2.4.8-.3 1-.5 2.4-.5 3.6" />
      <path d="M12 9.5a5.5 5.5 0 0 1 5.5 5.5c0 3-2.5 5-5.5 5s-5.5-2-5.5-5A5.5 5.5 0 0 1 12 9.5Z" />
      <path d="M10 14.5h.01M14 14.5h.01" />
    </Svg>
  );
}

export function BottleIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M10 2.8h4v2.4h-4z" />
      <path d="M9 5.2h6l1 3v10.6c0 1.3-1 2.4-2.3 2.4H10.3C9 21.2 8 20.1 8 18.8V8.2l1-3Z" />
      <path d="M8.4 11.5h7.2M8.4 15h7.2" />
    </Svg>
  );
}

export function StrollerIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 4h1.7a2 2 0 0 1 1.9 1.4L9 9.5" />
      <path d="M20 9.5a8.5 8.5 0 0 1-8.5 8.5H9V9.5h11Z" />
      <circle cx="9" cy="20.5" r="1.6" />
      <circle cx="17.5" cy="20.5" r="1.6" />
    </Svg>
  );
}

export function ChevronIcon(p: IconProps) {
  return (
    <Svg {...p} strokeWidth={p.strokeWidth ?? 2}>
      <path d="m5 9 7 7 7-7" />
    </Svg>
  );
}

export function CheckIcon(p: IconProps) {
  return (
    <Svg {...p} strokeWidth={p.strokeWidth ?? 2}>
      <path d="m4.5 12.5 5 5 10-11" />
    </Svg>
  );
}

export function CrossIcon(p: IconProps) {
  return (
    <Svg {...p} strokeWidth={p.strokeWidth ?? 2}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Svg>
  );
}

export function SparkIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 3.5 13.9 9l5.6 1.9-5.6 1.9L12 18.4l-1.9-5.6-5.6-1.9L10.1 9 12 3.5Z" />
    </Svg>
  );
}

/** Étoile de notation — pleine, demie ou vide, sur la même grille. */
export function StarIcon({
  fill = "full",
  className,
}: {
  fill?: "full" | "half" | "empty";
  className?: string;
}) {
  const d = "M12 3.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.6 9.7l5.8-.8L12 3.6Z";
  const gradId = `star-half-${fill}`;

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      {fill === "half" && (
        <defs>
          <linearGradient id={gradId}>
            <stop offset="50%" stopColor="currentColor" />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
        </defs>
      )}
      <path
        d={d}
        fill={fill === "empty" ? "none" : fill === "half" ? `url(#${gradId})` : "currentColor"}
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export const CATEGORY_ICONS: Record<Category, (p: IconProps) => React.ReactElement> = {
  SOMMEIL: MoonIcon,
  SECURITE: ShieldIcon,
  JEU: BlocksIcon,
  EVEIL: RainbowIcon,
  EXTERIEUR: TreeIcon,
  DOUDOU: RabbitIcon,
  REPAS: BottleIcon,
  TRANSPORT: StrollerIcon,
  AUTRE: SparkIcon,
};
