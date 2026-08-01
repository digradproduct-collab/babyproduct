import { db } from "@/lib/db";
import { CATEGORY_LABELS } from "@/lib/labels";

export default async function AnalyticsPage() {
  const [totalViews, totalClicks, topProducts, topPages] = await Promise.all([
    db.pageView.count(),
    db.click.count(),
    db.product.findMany({
      where: { status: "VALIDATED" },
      include: { _count: { select: { clicks: true } } },
      orderBy: { clicks: { _count: "desc" } },
      take: 10,
    }),
    db.pageView.groupBy({
      by: ["path"],
      _count: true,
      orderBy: { _count: { path: "desc" } },
      take: 10,
    }),
  ]);

  const conversionRate = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : "0";

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Analytics</h1>
      <p className="mt-1 text-ink-soft">
        Vues de page et clics affiliés, pour prioriser les produits à pousser sur les réseaux.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-cream-100 p-5">
          <p className="text-xs font-semibold uppercase text-ink-soft">Vues de page</p>
          <p className="mt-1 font-display text-3xl text-ink">{totalViews}</p>
        </div>
        <div className="rounded-2xl bg-cream-100 p-5">
          <p className="text-xs font-semibold uppercase text-ink-soft">Clics affiliés</p>
          <p className="mt-1 font-display text-3xl text-ink">{totalClicks}</p>
        </div>
        <div className="rounded-2xl bg-cream-100 p-5">
          <p className="text-xs font-semibold uppercase text-ink-soft">Taux de clic</p>
          <p className="mt-1 font-display text-3xl text-ink">{conversionRate}%</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl bg-cream-100 p-6">
          <h2 className="font-display text-lg text-ink">Top produits (clics)</h2>
          <table className="mt-4 w-full text-left text-sm">
            <thead className="text-ink-soft">
              <tr>
                <th className="py-2">Produit</th>
                <th className="py-2">Catégorie</th>
                <th className="py-2">Clics</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((p) => (
                <tr key={p.id} className="border-t border-cream-300">
                  <td className="py-2 font-medium text-ink">{p.name}</td>
                  <td className="py-2 text-ink-soft">{CATEGORY_LABELS[p.category]}</td>
                  <td className="py-2 text-ink-soft">{p._count.clicks}</td>
                </tr>
              ))}
              {topProducts.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-ink-soft">
                    Pas encore de données.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="rounded-2xl bg-cream-100 p-6">
          <h2 className="font-display text-lg text-ink">Pages les plus vues</h2>
          <table className="mt-4 w-full text-left text-sm">
            <thead className="text-ink-soft">
              <tr>
                <th className="py-2">Page</th>
                <th className="py-2">Vues</th>
              </tr>
            </thead>
            <tbody>
              {topPages.map((p) => (
                <tr key={p.path} className="border-t border-cream-300">
                  <td className="py-2 font-medium text-ink">{p.path}</td>
                  <td className="py-2 text-ink-soft">{p._count}</td>
                </tr>
              ))}
              {topPages.length === 0 && (
                <tr>
                  <td colSpan={2} className="py-6 text-center text-ink-soft">
                    Pas encore de données.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
