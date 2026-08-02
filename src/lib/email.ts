import { Resend } from "resend";
import { db } from "@/lib/db";
import { CATEGORY_LABELS } from "@/lib/labels";

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "Câlin Kids <onboarding@resend.dev>";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

function emailShell(title: string, bodyHtml: string) {
  return `
    <div style="background:#fbf4e9;padding:32px 16px;font-family:Georgia,serif;">
      <div style="max-width:520px;margin:0 auto;background:#fefcf8;border-radius:24px;padding:32px;">
        <p style="font-size:22px;font-weight:bold;color:#9c4433;margin:0 0 4px;">Câlin Kids</p>
        <h1 style="font-size:20px;color:#362a22;margin:0 0 16px;">${title}</h1>
        ${bodyHtml}
        <p style="margin-top:32px;font-size:12px;color:#75655a;">
          Câlin Kids — sélection de produits bébé &amp; enfants.
          <a href="${siteUrl}/mentions-legales" style="color:#75655a;">Mentions légales</a>
        </p>
      </div>
    </div>
  `;
}

export async function sendWelcomeEmail(email: string) {
  const resend = getResend();
  if (!resend) return;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Bienvenue chez Câlin Kids 💛",
    html: emailShell(
      "Merci pour votre inscription !",
      `<p style="color:#362a22;line-height:1.6;">
        Vous recevrez chaque semaine notre sélection des 5 produits bébé &amp; enfants les plus
        plébiscités du moment — repérés sur les réseaux sociaux, testés et validés par notre équipe.
      </p>
      <a href="${siteUrl}" style="display:inline-block;margin-top:16px;background:#c25640;color:#fff;
        padding:10px 20px;border-radius:999px;text-decoration:none;font-weight:bold;">
        Découvrir la sélection actuelle
      </a>`,
    ),
  });
}

/**
 * Envoie le "Top 5 de la semaine" à tous les abonnés. Retourne le nombre
 * d'envois effectués. Ne fait rien si RESEND_API_KEY n'est pas configurée
 * ou s'il n'y a pas assez de produits validés.
 */
export async function sendWeeklyDigest(): Promise<{ sent: number; skipped: string | null }> {
  const resend = getResend();
  if (!resend) return { sent: 0, skipped: "RESEND_API_KEY non configurée" };

  const [topProducts, subscribers] = await Promise.all([
    db.product.findMany({
      where: { status: "VALIDATED" },
      orderBy: [{ isFeatured: "desc" }, { validatedAt: "desc" }],
      take: 5,
    }),
    db.newsletterSubscriber.findMany({ select: { email: true } }),
  ]);

  if (topProducts.length === 0) return { sent: 0, skipped: "Aucun produit validé" };
  if (subscribers.length === 0) return { sent: 0, skipped: "Aucun abonné" };

  const itemsHtml = topProducts
    .map(
      (p) => `
      <div style="margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid #f0dcc0;">
        <p style="margin:0;font-weight:bold;color:#362a22;">${p.name}</p>
        <p style="margin:4px 0;font-size:13px;color:#75655a;">${CATEGORY_LABELS[p.category]}${
          p.estimatedPriceCents ? ` · ${(p.estimatedPriceCents / 100).toFixed(2)} €` : ""
        }</p>
        <a href="${siteUrl}/produits/${p.slug}" style="color:#c25640;font-size:13px;">Voir le produit →</a>
      </div>`,
    )
    .join("");

  const html = emailShell(
    "Le Top 5 de la semaine",
    `<div style="margin-top:8px;">${itemsHtml}</div>`,
  );

  const { error } = await resend.batch.send(
    subscribers.map((s) => ({
      from: FROM_EMAIL,
      to: s.email,
      subject: "🌟 Le Top 5 de la semaine — Câlin Kids",
      html,
    })),
  );

  if (error) {
    throw new Error(`Échec de l'envoi de la newsletter : ${error.message}`);
  }

  return { sent: subscribers.length, skipped: null };
}
