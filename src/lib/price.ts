/**
 * Un prix relevé chez un marchand se périme vite. L'afficher comme ferme
 * alors qu'il a changé expose à une pratique commerciale trompeuse
 * (art. L121-2 du Code de la consommation) ; plusieurs régies, dont Amazon,
 * l'interdisent aussi contractuellement au-delà de 24 h.
 *
 * D'où deux régimes distincts :
 *
 * - prix issu d'un flux de régie : daté, donc affiché comme constaté à une
 *   heure précise, et retiré dès qu'il dépasse le seuil de fraîcheur ;
 * - prix saisi à la main : jamais présenté comme ferme, mais comme
 *   indicatif — c'est ce qui permet de l'afficher sans le dater.
 */
export const PRICE_MAX_AGE_HOURS = 24;

export function isPriceFresh(priceUpdatedAt: Date | null | undefined): boolean {
  if (!priceUpdatedAt) return false;
  const ageMs = Date.now() - priceUpdatedAt.getTime();
  return ageMs >= 0 && ageMs < PRICE_MAX_AGE_HOURS * 3_600_000;
}

export function formatPrice(cents: number, currency = "EUR"): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency || "EUR",
  }).format(cents / 100);
}

export function formatPriceDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export type PublicPrice =
  /** Prix synchronisé depuis une régie et encore frais. */
  | { kind: "tracked"; label: string; checkedAt: string }
  /** Prix saisi manuellement : affiché, mais annoncé comme indicatif. */
  | { kind: "indicative"; label: string }
  /** Prix censé être automatisé mais périmé : on n'affiche plus rien. */
  | { kind: "stale" }
  | { kind: "none" };

export function publicPrice(product: {
  estimatedPriceCents: number | null;
  currency?: string | null;
  priceUpdatedAt?: Date | null;
  feedId?: string | null;
}): PublicPrice {
  if (product.estimatedPriceCents == null) return { kind: "none" };

  const label = formatPrice(product.estimatedPriceCents, product.currency ?? "EUR");

  // Produit non rattaché à un flux : le prix reste une indication éditoriale.
  if (!product.feedId) return { kind: "indicative", label };

  if (!isPriceFresh(product.priceUpdatedAt)) return { kind: "stale" };

  return { kind: "tracked", label, checkedAt: formatPriceDate(product.priceUpdatedAt!) };
}
