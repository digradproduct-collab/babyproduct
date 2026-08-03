import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import {
  addMetricSnapshot,
  deleteProduct,
  updateProduct,
  updateProductStatus,
} from "@/app/admin/actions";
import { ProductForm } from "@/components/admin/ProductForm";
import { LinkBuilder } from "@/components/admin/LinkBuilder";
import { STATUS_COLORS, STATUS_LABELS } from "@/lib/labels";
import type { ProductStatus } from "@/generated/prisma/client";

const STATUS_FLOW: ProductStatus[] = ["SPOTTED", "TESTING", "VALIDATED", "REJECTED"];
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, feeds] = await Promise.all([
    db.product.findUnique({
      where: { id },
      include: {
        metrics: { orderBy: { capturedAt: "desc" }, take: 12 },
        feed: { select: { name: true } },
        _count: { select: { clicks: true } },
      },
    }),
    db.productFeed.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!product) notFound();

  const updateWithId = updateProduct.bind(null, id);
  const addMetricWithId = addMetricSnapshot.bind(null, id);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">{product.name}</h1>
          <span
            className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLORS[product.status]}`}
          >
            {STATUS_LABELS[product.status]}
          </span>
        </div>
        {product.status === "VALIDATED" && (
          <Link
            href={`/produits/${product.slug}`}
            target="_blank"
            className="rounded-full border border-sage-500 px-4 py-2 text-sm font-semibold text-sage-700 hover:bg-sage-100"
          >
            Voir la fiche publique →
          </Link>
        )}
      </div>

      <section className="mt-6 rounded-2xl bg-cream-100 p-6">
        <h2 className="font-display text-lg text-ink">Statut du pipeline</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {STATUS_FLOW.map((s) => (
            <form key={s} action={updateProductStatus.bind(null, id, s)}>
              <button
                type="submit"
                disabled={product.status === s}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  product.status === s
                    ? "bg-terracotta-600 text-white"
                    : "bg-cream-300 text-ink hover:bg-cream-400"
                }`}
              >
                {STATUS_LABELS[s]}
              </button>
            </form>
          ))}
        </div>

        {product.viralScore != null && (
          <div className="mt-4 rounded-xl bg-gold-400/20 p-4 text-sm text-ink">
            <p className="font-semibold">Score de viralité (IA) : {product.viralScore}/100</p>
            {product.viralScoreRationale && (
              <p className="mt-1 text-ink-soft">{product.viralScoreRationale}</p>
            )}
            <p className="mt-1 text-xs text-ink-soft">
              Proposition IA — vérifiée et éditable manuellement avant validation.
            </p>
          </div>
        )}

        <div className="mt-4 flex gap-6 text-sm text-ink-soft">
          <span>{product._count.clicks} clic(s) affilié(s)</span>
          <span>Ajouté le {product.createdAt.toLocaleDateString("fr-FR")}</span>
          {product.validatedAt && (
            <span>Validé le {product.validatedAt.toLocaleDateString("fr-FR")}</span>
          )}
        </div>

        {product.status === "VALIDATED" && (
          <div className="mt-4">
            <LinkBuilder productUrl={`${siteUrl}/produits/${product.slug}`} />
          </div>
        )}
      </section>

      <section className="mt-6 rounded-2xl bg-cream-100 p-6">
        <h2 className="font-display text-lg text-ink">Fiche produit</h2>
        <div className="mt-4">
          <ProductForm
            action={updateWithId}
            product={product}
            submitLabel="Enregistrer"
            feeds={feeds}
          />
        </div>
      </section>

      <section className="mt-6 rounded-2xl bg-cream-100 p-6">
        <h2 className="font-display text-lg text-ink">
          Historique des métriques
        </h2>
        <p className="mt-1 text-sm text-ink-soft">
          Ajoutez un relevé pour suivre si le buzz est durable ou un pic isolé.
        </p>

        <form action={addMetricWithId} className="mt-4 flex flex-wrap items-end gap-3 text-sm">
          <label className="flex flex-col gap-1">
            Vues
            <input name="views" type="number" className="w-28 rounded-lg border border-cream-500 bg-white px-2 py-1.5" />
          </label>
          <label className="flex flex-col gap-1">
            Likes
            <input name="likes" type="number" className="w-28 rounded-lg border border-cream-500 bg-white px-2 py-1.5" />
          </label>
          <label className="flex flex-col gap-1">
            Commentaires
            <input name="comments" type="number" className="w-28 rounded-lg border border-cream-500 bg-white px-2 py-1.5" />
          </label>
          <label className="flex flex-col gap-1">
            Partages
            <input name="shares" type="number" className="w-28 rounded-lg border border-cream-500 bg-white px-2 py-1.5" />
          </label>
          <button className="rounded-full bg-sage-600 px-4 py-2 font-semibold text-white hover:bg-sage-700">
            Ajouter le relevé
          </button>
        </form>

        <table className="mt-5 w-full text-left text-sm">
          <thead className="text-ink-soft">
            <tr>
              <th className="py-2">Date</th>
              <th className="py-2">Vues</th>
              <th className="py-2">Likes</th>
              <th className="py-2">Commentaires</th>
              <th className="py-2">Partages</th>
              <th className="py-2">Engagement</th>
            </tr>
          </thead>
          <tbody>
            {product.metrics.map((m) => (
              <tr key={m.id} className="border-t border-cream-300">
                <td className="py-2">{m.capturedAt.toLocaleDateString("fr-FR")}</td>
                <td className="py-2">{m.views ?? "—"}</td>
                <td className="py-2">{m.likes ?? "—"}</td>
                <td className="py-2">{m.comments ?? "—"}</td>
                <td className="py-2">{m.shares ?? "—"}</td>
                <td className="py-2">{m.engagementRate != null ? `${m.engagementRate}%` : "—"}</td>
              </tr>
            ))}
            {product.metrics.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-ink-soft">
                  Aucun relevé pour l&apos;instant.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="mt-6 rounded-2xl bg-berry-400/10 p-6">
        <h2 className="font-display text-lg text-berry-600">Zone dangereuse</h2>
        <form action={deleteProduct.bind(null, id)} className="mt-3">
          <button className="rounded-full border border-berry-500 px-4 py-2 text-sm font-semibold text-berry-600 hover:bg-berry-500 hover:text-white">
            Supprimer ce produit
          </button>
        </form>
      </section>
    </div>
  );
}
