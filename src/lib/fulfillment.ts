import type { Fulfillment, Product } from "@/generated/prisma/client";

export const FULFILLMENT_LABELS: Record<Fulfillment, string> = {
  AFFILIATE: "Affiliation",
  OWN_STOCK: "Stock propre",
  DROPSHIP: "Dropshipping",
};

export const FULFILLMENT_HINTS: Record<Fulfillment, string> = {
  AFFILIATE:
    "Le visiteur part chez le marchand, nous touchons une commission. Sert surtout à mesurer l'intention d'achat.",
  OWN_STOCK:
    "Nous avons acheté le stock et nous expédions. Marge pleine, délai court, mais capital immobilisé.",
  DROPSHIP:
    "Le fournisseur expédie directement au client. Aucun stock à financer, mais délai plus long et responsabilité produit à surveiller.",
};

/** Modes où c'est nous qui encaissons — donc où un lien de paiement est requis. */
export function isOwnSale(fulfillment: Fulfillment): boolean {
  return fulfillment === "OWN_STOCK" || fulfillment === "DROPSHIP";
}

/**
 * États de l'Espace économique européen. Acheter à un fournisseur établi
 * dans cette zone évite d'endosser les obligations de l'importateur.
 */
const EEA = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
  "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK",
  "SI", "ES", "SE", "IS", "LI", "NO",
]);

export function isOutsideEea(countryCode: string | null | undefined): boolean {
  if (!countryCode) return false;
  return !EEA.has(countryCode.trim().toUpperCase());
}

/**
 * Importer depuis hors UE fait de nous l'importateur au sens du règlement
 * GPSR 2023/988 : nous reprenons les obligations du fabricant (conformité,
 * documentation technique, traçabilité, rappels). Sur de la puériculture,
 * l'enjeu est réel, d'où l'avertissement à la saisie.
 */
export function importerWarning(product: {
  fulfillment: Fulfillment;
  supplierCountry?: string | null;
}): string | null {
  if (!isOwnSale(product.fulfillment)) return null;
  if (!isOutsideEea(product.supplierCountry)) return null;

  return (
    "Fournisseur hors Espace économique européen : en vendant ce produit vous devenez " +
    "importateur au sens du règlement GPSR, et endossez les obligations du fabricant " +
    "(conformité, documentation technique, traçabilité, gestion des rappels). " +
    "Passer par un grossiste établi dans l'UE transfère cette responsabilité."
  );
}

export type DeliveryEstimate = { label: string; longDelay: boolean } | null;

/**
 * Formule le délai annoncé au client. Au-delà de 30 jours, l'article L216-1
 * impose un accord explicite : on le signale à l'admin.
 */
export function deliveryEstimate(product: {
  fulfillment: Fulfillment;
  deliveryMinDays?: number | null;
  deliveryMaxDays?: number | null;
}): DeliveryEstimate {
  if (!isOwnSale(product.fulfillment)) return null;

  const min = product.deliveryMinDays ?? null;
  const max = product.deliveryMaxDays ?? null;
  if (min == null && max == null) return null;

  const longDelay = (max ?? min ?? 0) > 30;

  if (min != null && max != null && min !== max) {
    return { label: `Livraison estimée sous ${min} à ${max} jours ouvrés`, longDelay };
  }

  const single = max ?? min!;
  return { label: `Livraison estimée sous ${single} jours ouvrés`, longDelay };
}

export type BuyAction =
  /** Lien affilié : le visiteur part chez un marchand. */
  | { kind: "affiliate"; label: string }
  /** Nous vendons : le visiteur va vers notre page de paiement. */
  | { kind: "buy"; label: string }
  /** Vente propre annoncée mais rupture déclarée. */
  | { kind: "out-of-stock"; label: string }
  /** Rien à proposer : on mesure l'intérêt sans promettre de vente. */
  | { kind: "soon"; label: string };

/**
 * Décide ce que fait le bouton principal. Un seul endroit pour cette règle,
 * afin que fiche, carte et barre collante ne divergent jamais.
 */
export function buyAction(product: {
  fulfillment: Fulfillment;
  affiliateUrl?: string | null;
  checkoutUrl?: string | null;
  inStock?: boolean | null;
}): BuyAction {
  if (isOwnSale(product.fulfillment)) {
    if (!product.checkoutUrl) return { kind: "soon", label: "Bientôt disponible" };
    if (product.inStock === false) return { kind: "out-of-stock", label: "Rupture de stock" };
    return { kind: "buy", label: "Acheter" };
  }

  if (product.affiliateUrl) return { kind: "affiliate", label: "Voir l'offre" };
  return { kind: "soon", label: "Bientôt disponible" };
}

/** Destination réelle du clic, ou null quand il n'y a rien à ouvrir. */
export function buyDestination(product: Pick<Product, "fulfillment" | "affiliateUrl" | "checkoutUrl" | "inStock">): string | null {
  const action = buyAction(product);
  if (action.kind === "buy") return product.checkoutUrl;
  if (action.kind === "affiliate") return product.affiliateUrl;
  return null;
}
