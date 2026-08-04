import { StarIcon } from "@/components/ui/Icon";

/**
 * Notation en étoiles dessinées. La demi-étoile évite l'arrondi trompeur
 * d'un 4,6 affiché en 5 pleines.
 */
export function Rating({
  value,
  count,
  size = "sm",
  className = "",
}: {
  value: number;
  count?: number;
  size?: "sm" | "md";
  className?: string;
}) {
  const star = size === "md" ? "h-4.5 w-4.5" : "h-3.5 w-3.5";

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="inline-flex items-center gap-0.5 text-gold-700">
        {Array.from({ length: 5 }, (_, i) => {
          const filled = value - i;
          return (
            <StarIcon
              key={i}
              className={star}
              fill={filled >= 0.75 ? "full" : filled >= 0.25 ? "half" : "empty"}
            />
          );
        })}
      </span>
      <span className="text-xs tabular-nums text-ink-soft">
        {value.toFixed(1)}
        {count != null && count > 0 && ` · ${count} avis`}
      </span>
      <span className="sr-only">
        Note de {value.toFixed(1)} sur 5{count ? `, basée sur ${count} avis` : ""}
      </span>
    </span>
  );
}
