import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { CATEGORY_LABELS, STATUS_COLORS, STATUS_LABELS } from "@/lib/labels";

export const metadata = { title: "Pipeline (transparence) — Câlin Kids" };
export const dynamic = "force-dynamic";

export default async function PublicPipelinePage() {
  if (process.env.NEXT_PUBLIC_SHOW_PIPELINE !== "true") notFound();

  const products = await db.product.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      category: true,
      status: true,
      viralScore: true,
      createdAt: true,
    },
    take: 100,
  });

  return (
    <main className="mx-auto max-w-4xl px-6 py-14">
      <h1 className="font-display text-3xl text-ink">Pipeline — vue transparence</h1>
      <p className="mt-2 text-ink-soft">
        Par souci de transparence, voici en lecture seule les produits que nous suivons
        actuellement, sans détails commerciaux (fournisseur, marge, coûts).
      </p>

      <div className="mt-8 overflow-hidden rounded-2xl border border-cream-300 bg-cream-100">
        <table className="w-full text-left text-sm">
          <thead className="bg-cream-300 text-ink-soft">
            <tr>
              <th className="px-4 py-3">Produit</th>
              <th className="px-4 py-3">Catégorie</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Score</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-cream-300">
                <td className="px-4 py-3 font-medium text-ink">{p.name}</td>
                <td className="px-4 py-3 text-ink-soft">{CATEGORY_LABELS[p.category]}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COLORS[p.status]}`}>
                    {STATUS_LABELS[p.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink-soft">{p.viralScore ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
