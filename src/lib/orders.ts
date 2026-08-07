import type { Order, OrderStatus, Product } from "@/generated/prisma/client";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PLACED: "À commander",
  ORDERED: "Commandée au fournisseur",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
  REFUNDED: "Remboursée",
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  PLACED: "bg-terracotta-600 text-white",
  ORDERED: "bg-gold-400/40 text-ink",
  SHIPPED: "bg-sage-200 text-sage-800",
  DELIVERED: "bg-sage-500 text-white",
  CANCELLED: "bg-cream-400 text-ink-soft",
  REFUNDED: "bg-cream-400 text-ink-soft",
};

/** Étapes encore ouvertes : celles qui demandent une action de notre part. */
export const OPEN_STATUSES: OrderStatus[] = ["PLACED", "ORDERED", "SHIPPED"];

/** Transitions autorisées — évite de sauter une étape ou de revenir en arrière. */
export const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  PLACED: ["ORDERED", "CANCELLED", "REFUNDED"],
  ORDERED: ["SHIPPED", "CANCELLED", "REFUNDED"],
  SHIPPED: ["DELIVERED", "REFUNDED"],
  DELIVERED: ["REFUNDED"],
  CANCELLED: [],
  REFUNDED: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return NEXT_STATUSES[from].includes(to);
}

/**
 * Date de livraison au plus tard, calculée à la commande depuis le délai
 * annoncé sur la fiche. En jours ouvrés : cinq par semaine, week-ends
 * exclus, car c'est ce que le client a lu.
 */
export function computePromisedBy(
  placedAt: Date,
  deliveryMaxDays: number | null | undefined,
): Date | null {
  if (!deliveryMaxDays || deliveryMaxDays < 1) return null;

  const date = new Date(placedAt);
  let remaining = deliveryMaxDays;
  while (remaining > 0) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    if (day !== 0 && day !== 6) remaining -= 1;
  }
  return date;
}

export type DeadlineState =
  | { kind: "none" }
  | { kind: "ok"; daysLeft: number }
  | { kind: "soon"; daysLeft: number }
  | { kind: "late"; daysLate: number };

const DAY_MS = 86_400_000;

/**
 * Position d'une commande par rapport à la date promise. Dépasser cette date
 * n'est pas un simple retard : l'article L216-1 ouvre au client un droit à
 * résolution de la vente après mise en demeure. D'où l'alerte dès l'approche.
 */
export function deadlineState(order: Pick<Order, "status" | "promisedBy">, now = new Date()): DeadlineState {
  if (!order.promisedBy) return { kind: "none" };
  if (!OPEN_STATUSES.includes(order.status)) return { kind: "none" };

  const diff = order.promisedBy.getTime() - now.getTime();
  const days = Math.ceil(diff / DAY_MS);

  if (days < 0) return { kind: "late", daysLate: Math.abs(days) };
  if (days <= 3) return { kind: "soon", daysLeft: days };
  return { kind: "ok", daysLeft: days };
}

/**
 * Marge réelle d'une commande. Utilise le coût saisi au moment de commander
 * chez le fournisseur ; à défaut, retombe sur l'estimation de la fiche en le
 * signalant, car une marge estimée ne vaut pas une marge constatée.
 */
export function orderMargin(
  order: Pick<Order, "amountCents" | "supplierCostCents" | "quantity">,
  product: Pick<Product, "estimatedCostCents">,
): { cents: number; pct: number; estimated: boolean } | null {
  const unitCost = order.supplierCostCents ?? product.estimatedCostCents ?? null;
  if (unitCost == null) return null;

  const cost = unitCost * order.quantity;
  const cents = order.amountCents - cost;
  const pct = order.amountCents > 0 ? Math.round((cents / order.amountCents) * 1000) / 10 : 0;

  return { cents, pct, estimated: order.supplierCostCents == null };
}
