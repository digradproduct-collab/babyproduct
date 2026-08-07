import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { computePromisedBy } from "@/lib/orders";
import { isOwnSale } from "@/lib/fulfillment";

/**
 * Réception des paiements encaissés par Stripe.
 *
 * Sans ce point d'entrée, une vente resterait dans le tableau de bord Stripe
 * et la mesure du site s'arrêterait au clic. Le webhook est facultatif : tant
 * qu'il n'est pas configuré, les commandes peuvent être saisies à la main
 * depuis l'admin.
 *
 * Configuration : créer un endpoint Stripe vers /api/webhooks/stripe sur
 * l'événement `checkout.session.completed`, puis renseigner STRIPE_SECRET_KEY
 * et STRIPE_WEBHOOK_SECRET.
 *
 * Le produit est identifié par la métadonnée `productId` du Payment Link, ou
 * à défaut par `client_reference_id`.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const apiKey = process.env.STRIPE_SECRET_KEY;

  if (!secret || !apiKey) {
    return NextResponse.json({ error: "stripe non configuré" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "signature manquante" }, { status: 400 });
  }

  // La signature porte sur le corps brut : le parser en JSON d'abord la
  // rendrait invérifiable.
  const payload = await request.text();

  let event: Stripe.Event;
  try {
    const stripe = new Stripe(apiKey);
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (error) {
    console.error("Signature Stripe invalide", error);
    return NextResponse.json({ error: "signature invalide" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true, ignored: event.type });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (session.payment_status !== "paid") {
    return NextResponse.json({ received: true, ignored: "non payée" });
  }

  const productRef = session.metadata?.productId ?? session.client_reference_id ?? null;
  if (!productRef) {
    console.error("Paiement Stripe sans productId", session.id);
    return NextResponse.json({ received: true, ignored: "produit inconnu" });
  }

  const product = await db.product.findFirst({
    where: { OR: [{ id: productRef }, { slug: productRef }] },
  });

  if (!product) {
    console.error("Produit introuvable pour le paiement", productRef);
    return NextResponse.json({ received: true, ignored: "produit introuvable" });
  }

  if (!isOwnSale(product.fulfillment)) {
    console.error("Paiement reçu sur un produit en affiliation", product.slug);
    return NextResponse.json({ received: true, ignored: "produit non vendu par nous" });
  }

  // Stripe rejoue ses webhooks : la contrainte d'unicité sur paymentRef rend
  // l'opération idempotente.
  const existing = await db.order.findUnique({ where: { paymentRef: session.id } });
  if (existing) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  const placedAt = new Date();
  const quantity = 1;

  await db.order.create({
    data: {
      productId: product.id,
      quantity,
      amountCents: session.amount_total ?? product.estimatedPriceCents ?? 0,
      currency: (session.currency ?? "eur").toUpperCase(),
      customerEmail: session.customer_details?.email ?? null,
      paymentRef: session.id,
      promisedBy: computePromisedBy(placedAt, product.deliveryMaxDays),
      supplierCostCents: product.estimatedCostCents,
    },
  });

  return NextResponse.json({ received: true, created: true });
}
