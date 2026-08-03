import { db } from "@/lib/db";
import { sendWeeklyDigestNow } from "@/app/admin/actions";
import { getConversionByProductAndSource } from "@/lib/conversion";
import { getDailyTrend, getPeriodComparison, getSourceTotals } from "@/lib/timeseries";
import { DateRangePicker } from "@/components/admin/DateRangePicker";
import { StatTile } from "@/components/admin/charts/StatTile";
import { TrendChart } from "@/components/admin/charts/TrendChart";
import { SourceBarChart } from "@/components/admin/charts/SourceBarChart";

const VALID_RANGES = [7, 30, 90];

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{
    newsletterSent?: string;
    newsletterError?: string;
    range?: string;
  }>;
}) {
  const { newsletterSent, newsletterError, range } = await searchParams;
  const days = VALID_RANGES.includes(Number(range)) ? Number(range) : 30;
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - (days - 1));

  const [subscriberCount, comparison, dailyTrend, sourceTotals, conversionRows] =
    await Promise.all([
      db.newsletterSubscriber.count(),
      getPeriodComparison(days),
      getDailyTrend(days),
      getSourceTotals(days),
      getConversionByProductAndSource(since),
    ]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">Analytics</h1>
          <p className="mt-1 text-ink-soft">
            Vues et clics affiliés par produit et par source d&apos;acquisition, pour savoir ce
            qui convertit vraiment.
          </p>
        </div>
        <DateRangePicker current={days} />
      </div>

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

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Vues fiche produit"
          value={comparison.views.value}
          deltaPct={comparison.views.deltaPct}
          sparkline={dailyTrend.map((d) => d.views)}
        />
        <StatTile
          label="Clics affiliés"
          value={comparison.clicks.value}
          deltaPct={comparison.clicks.deltaPct}
          sparkline={dailyTrend.map((d) => d.clicks)}
        />
        <StatTile
          label="Taux de conversion"
          value={comparison.conversionRate.value}
          suffix="%"
          deltaPct={comparison.conversionRate.deltaPct}
        />
        <StatTile
          label="Nouveaux abonnés"
          value={comparison.newSubscribers.value}
          deltaPct={comparison.newSubscribers.deltaPct}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TrendChart
          title="Vues fiche produit / jour"
          data={dailyTrend.map((d) => ({ date: d.date, value: d.views }))}
          color="var(--color-terracotta-600)"
        />
        <TrendChart
          title="Clics affiliés / jour"
          data={dailyTrend.map((d) => ({ date: d.date, value: d.clicks }))}
          color="var(--color-chart-blue)"
        />
      </div>

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

      <section className="mt-6 rounded-2xl bg-cream-100 p-6">
        <h2 className="font-display text-lg text-ink">Taux de conversion par source</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Toutes fiches produits confondues — comparez l&apos;organique réseaux sociaux à vos
          campagnes publicitaires sur la période sélectionnée.
        </p>
        <div className="mt-4">
          <SourceBarChart data={sourceTotals} />
        </div>
      </section>

      <section className="mt-6 rounded-2xl bg-cream-100 p-6">
        <h2 className="font-display text-lg text-ink">Conversion par produit &amp; par source</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Pour chaque produit : combien de vues sa fiche a reçues depuis chaque source, et combien
          ont cliqué vers l&apos;offre.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
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
                    Pas encore de données sur cette période.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
