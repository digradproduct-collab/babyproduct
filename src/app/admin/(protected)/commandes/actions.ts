"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { canTransition, computePromisedBy } from "@/lib/orders";
import { isOwnSale } from "@/lib/fulfillment";
import type { OrderStatus } from "@/generated/prisma/client";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
}

const STATUSES: OrderStatus[] = [
  "PLACED",
  "ORDERED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

function toCents(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim().replace(",", ".");
  if (!raw) return null;
  const n = Number.parseFloat(raw);
  return Number.isNaN(n) ? null : Math.round(n * 100);
}

/** Avance une commande d'une étape, en refusant les sauts et les retours. */
export async function advanceOrder(orderId: string, formData: FormData) {
  await requireAdmin();

  const target = String(formData.get("status") ?? "");
  if (!STATUSES.includes(target as OrderStatus)) return;

  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) return;

  const next = target as OrderStatus;
  if (!canTransition(order.status, next)) return;

  const now = new Date();

  await db.order.update({
    where: { id: orderId },
    data: {
      status: next,
      orderedAt: next === "ORDERED" ? now : undefined,
      shippedAt: next === "SHIPPED" ? now : undefined,
      deliveredAt: next === "DELIVERED" ? now : undefined,
      supplierOrderRef:
        String(formData.get("supplierOrderRef") ?? "").trim() || undefined,
      trackingUrl: String(formData.get("trackingUrl") ?? "").trim() || undefined,
      supplierCostCents: toCents(formData.get("supplierCost")) ?? undefined,
      note: String(formData.get("note") ?? "").trim() || undefined,
    },
  });

  revalidatePath("/admin/commandes");
}

/**
 * Saisie manuelle d'une commande, pour les ventes encaissées hors webhook
 * (lien de paiement sans endpoint configuré, virement, vente de la main à la
 * main). Sans elle, l'écran resterait vide tant que Stripe n'est pas branché.
 */
export async function createManualOrder(formData: FormData) {
  await requireAdmin();

  const productId = String(formData.get("productId") ?? "");
  const product = await db.product.findUnique({ where: { id: productId } });

  if (!product || !isOwnSale(product.fulfillment)) {
    redirect("/admin/commandes?erreur=produit");
  }

  const amountCents = toCents(formData.get("amount"));
  if (amountCents == null) {
    redirect("/admin/commandes?erreur=montant");
  }

  const quantityRaw = Number.parseInt(String(formData.get("quantity") ?? "1"), 10);
  const quantity = Number.isNaN(quantityRaw) || quantityRaw < 1 ? 1 : quantityRaw;
  const placedAt = new Date();

  await db.order.create({
    data: {
      productId: product.id,
      quantity,
      amountCents,
      currency: product.currency,
      customerEmail: String(formData.get("customerEmail") ?? "").trim() || null,
      supplierCostCents: toCents(formData.get("supplierCost")) ?? product.estimatedCostCents,
      promisedBy: computePromisedBy(placedAt, product.deliveryMaxDays),
    },
  });

  revalidatePath("/admin/commandes");
  redirect("/admin/commandes?cree=1");
}
