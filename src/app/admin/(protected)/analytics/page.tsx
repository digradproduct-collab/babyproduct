import { db } from "@/lib/db";
import { sendWeeklyDigestNow } from "@/app/admin/actions";
import { getConversionByProductAndSource, aggregateBySource } from "@/lib/conversion";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ newsletterSent?: string; newsletterError?: string }>;
}) {
  const { newsletterSent, newsletterError } = await searchParams;

  const [totalViews, totalClicks, subscriberCount, conversionRows] = await Promise.all([
    db.pageView.count(),
    db.click.count(),
    db.newsletterSubscriber.count(),
    getConversionByProductAndSource(),
  ]);

  const sourceRows = aggregateBySource(conversionRows);
  const overallConversion = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : "0";

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Analytics</h1>
      <p className="mt-1 text-ink-soft">
        Vues et clics affiliés par produit et par source d&apos;acquisition (organique réseaux
        sociaux, publicité...), pour savoir ce qui convertit vraiment.
      </p>

      {newsletterSent && (
        <p className="mt-4 rounded-xl bg-sage-200 px-4 py-3 text-sm text-sage-800">
          Newsletter envoyée à {newsletterSent} abonné(s).
        </p>
      )}
      {newsletterError && (
        <p className="mt-4 rounded-xl bg-berry-400/20 px-4 py-3 text-sm text-berry-700">
          Newsletter non envoyée : {newsletterError}
        </p>
      )}

      <section className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-cream-100 p-5">
        <div>
          <p className="text-xs font-semibold uppercase text-ink-soft">Newsletter</p>
          <p className="mt-1 font-display text-2xl text-ink">{subscriberCount} abonné(s)</p>
        </div>
        <form action={sendWeeklyDigestNow}>
          <button className="rounded-full bg-terracotta-600 px-4 py-2 text-sm font-semibold text-white hover:bg-terracotta-700">
            Envoyer le Top 5 maintenant
          </button>
        </form>
      </section>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-cream-100 p-5">
          <p className="text-xs font-semibold uppercase text-ink-soft">Vues de page (site entier)</p>
          <p className="mt-1 font-display text-3xl text-ink">{totalViews}</p>
        </div>
        <div className="rounded-2xl bg-cream-100 p-5">
          <p className="text-xs font-semibold uppercase text-ink-soft">Clics affiliés</p>
          <p className="mt-1 font-display text-3xl text-ink">{totalClicks}</p>
        </div>
        <div className="rounded-2xl bg-cream-100 p-5">
          <p className="text-xs font-semibold uppercase text-ink-soft">Taux de clic global</p>
          <p className="mt-1 font-display text-3xl text-ink">{overallConversion}%</p>
        </div>
      </div>

      <section className="mt-8 rounded-2xl bg-cream-100 p-6">
        <h2 className="font-display text-lg text-ink">Performance par source</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Toutes fiches produits confondues — comparez l&apos;organique réseaux sociaux à vos
          campagnes publicitaires.
        </p>
        <table className="mt-4 w-full text-left text-sm">
          <thead className="text-ink-soft">
            <tr>
              <th className="py-2">Source (utm_source)</th>
              <th className="py-2">Vues fiche produit</th>
              <th className="py-2">Clics</th>
              <th className="py-2">Conversion</th>
            </tr>
          </thead>
          <tbody>
            {sourceRows.map((s) => (
              <tr key={s.source} className="border-t border-cream-300">
                <td className="py-2 font-medium text-ink">{s.source}</td>
                <td className="py-2 text-ink-soft">{s.views}</td>
                <td className="py-2 text-ink-soft">{s.clicks}</td>
                <td className="py-2 text-ink-soft">{s.conversionRate}%</td>
              </tr>
            ))}
            {sourceRows.length === 0 && (
              <tr>
                <td colSpan={4} className="py-6 text-center text-ink-soft">
                  Pas encore de données. Ajoutez <code>?utm_source=tiktok&amp;utm_medium=organic</code>{" "}
                  à vos liens partagés pour commencer à mesurer.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="mt-6 rounded-2xl bg-cream-100 p-6">
        <h2 className="font-display text-lg text-ink">Conversion par produit &amp; par source</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Pour chaque produit : combien de vues sa fiche a reçues depuis chaque source, et combien
          ont cliqué vers l&apos;offre.
        </p>
        <table className="mt-4 w-full text-left text-sm">
          <thead className="text-ink-soft">
            <tr>
              <th className="py-2">Produit</th>
              <th className="py-2">Source</th>
              <th className="py-2">Vues</th>
              <th className="py-2">Clics</th>
              <th className="py-2">Conversion</th>
            </tr>
          </thead>
          <tbody>
            {conversionRows.map((row) => (
              <tr key={`${row.productId}-${row.source}`} className="border-t border-cream-300">
                <td className="py-2 font-medium text-ink">{row.productName}</td>
                <td className="py-2 text-ink-soft">{row.source}</td>
                <td className="py-2 text-ink-soft">{row.views}</td>
                <td className="py-2 text-ink-soft">{row.clicks}</td>
                <td className="py-2 text-ink-soft">{row.conversionRate}%</td>
              </tr>
            ))}
            {conversionRows.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-ink-soft">
                  Pas encore de données.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
