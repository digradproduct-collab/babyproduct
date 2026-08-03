import { db } from "@/lib/db";
import { createFeed, deleteFeed, syncFeedNow, toggleFeed } from "./actions";
import { NETWORK_LABELS, NETWORK_MAPPINGS } from "@/lib/feeds/presets";
import { PRICE_MAX_AGE_HOURS } from "@/lib/price";
import type { AffiliateNetwork } from "@/generated/prisma/client";

export const metadata = { title: "Flux régies — Câlin Kids" };
export const dynamic = "force-dynamic";

const NETWORKS: AffiliateNetwork[] = ["AWIN", "EFFILIATION", "RAKUTEN", "TRADEDOUBLER", "AUTRE"];

function formatDate(date: Date | null) {
  if (!date) return "jamais";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function FeedsPage({
  searchParams,
}: {
  searchParams: Promise<{ cree?: string; supprime?: string; erreur?: string }>;
}) {
  const { cree, supprime, erreur } = await searchParams;

  const [feeds, linkedCounts] = await Promise.all([
    db.productFeed.findMany({ orderBy: { createdAt: "desc" } }),
    db.product.groupBy({
      by: ["feedId"],
      where: { feedId: { not: null } },
      _count: true,
    }),
  ]);

  const linked = new Map(linkedCounts.map((c) => [c.feedId, c._count]));

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Flux des régies</h1>
      <p className="mt-1 max-w-3xl text-ink-soft">
        Chaque flux est un catalogue fourni par une régie d&apos;affiliation. Une fois un produit
        rattaché à un flux (champ « Identifiant chez l&apos;annonceur » de la fiche produit), son
        prix, son stock et son lien tracké se mettent à jour automatiquement chaque nuit.
      </p>

      {cree && (
        <p className="mt-4 rounded-xl bg-sage-200 px-4 py-3 text-sm text-sage-800">
          Flux enregistré. Lancez une synchronisation pour vérifier la configuration.
        </p>
      )}
      {supprime && (
        <p className="mt-4 rounded-xl bg-cream-300 px-4 py-3 text-sm text-ink">Flux supprimé.</p>
      )}
      {erreur && (
        <p className="mt-4 rounded-xl bg-berry-400/30 px-4 py-3 text-sm text-berry-600">
          Le nom et l&apos;URL du flux sont obligatoires.
        </p>
      )}

      <section className="mt-8">
        <h2 className="font-display text-xl text-ink">Flux configurés</h2>

        {feeds.length === 0 ? (
          <p className="mt-4 rounded-2xl bg-cream-100 p-6 text-center text-ink-soft">
            Aucun flux pour l&apos;instant. Ajoutez-en un ci-dessous.
          </p>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            {feeds.map((feed) => (
              <div key={feed.id} className="rounded-2xl bg-cream-100 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-ink">{feed.name}</p>
                      <span className="rounded-full bg-cream-300 px-2.5 py-0.5 text-xs text-ink-soft">
                        {NETWORK_LABELS[feed.network]} · {feed.format}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          feed.enabled ? "bg-sage-500 text-white" : "bg-cream-400 text-ink-soft"
                        }`}
                      >
                        {feed.enabled ? "Actif" : "En pause"}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-xs text-ink-soft" title={feed.url}>
                      {feed.url}
                    </p>
                    <p className="mt-2 text-sm text-ink-soft">
                      {linked.get(feed.id) ?? 0} produit(s) rattaché(s) · dernière synchro{" "}
                      {formatDate(feed.lastSyncAt)}
                    </p>
                    {feed.lastSyncMessage && (
                      <p
                        className={`mt-1 text-sm ${
                          feed.lastSyncOk ? "text-sage-700" : "text-berry-600"
                        }`}
                      >
                        {feed.lastSyncOk ? "✓" : "✕"} {feed.lastSyncMessage}
                        {feed.lastItemCount ? ` (${feed.lastItemCount} articles lus)` : ""}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    <form action={syncFeedNow.bind(null, feed.id)}>
                      <button className="rounded-full bg-terracotta-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-terracotta-700">
                        Synchroniser
                      </button>
                    </form>
                    <form action={toggleFeed.bind(null, feed.id)}>
                      <button className="rounded-full border border-cream-500 px-3 py-1.5 text-sm hover:border-terracotta-500">
                        {feed.enabled ? "Mettre en pause" : "Activer"}
                      </button>
                    </form>
                    <form action={deleteFeed.bind(null, feed.id)}>
                      <button className="rounded-full border border-cream-500 px-3 py-1.5 text-sm text-berry-600 hover:border-berry-500">
                        Supprimer
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl text-ink">Ajouter un flux</h2>

        <form action={createFeed} className="mt-4 flex flex-col gap-4 rounded-2xl bg-cream-100 p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <label className="text-sm">
              <span className="font-medium text-ink">Nom interne</span>
              <input
                name="name"
                required
                placeholder="Awin — Vertbaudet"
                className="mt-1 w-full rounded-lg border border-cream-500 bg-white px-3 py-2 outline-none focus:border-terracotta-500"
              />
            </label>

            <label className="text-sm">
              <span className="font-medium text-ink">Régie</span>
              <select
                name="network"
                className="mt-1 w-full rounded-lg border border-cream-500 bg-white px-3 py-2 outline-none focus:border-terracotta-500"
              >
                {NETWORKS.map((n) => (
                  <option key={n} value={n}>
                    {NETWORK_LABELS[n]}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm">
              <span className="font-medium text-ink">Format</span>
              <select
                name="format"
                className="mt-1 w-full rounded-lg border border-cream-500 bg-white px-3 py-2 outline-none focus:border-terracotta-500"
              >
                <option value="CSV">CSV (Awin, Rakuten)</option>
                <option value="XML">XML (Effiliation)</option>
                <option value="JSON">JSON (TradeDoubler)</option>
              </select>
            </label>
          </div>

          <label className="text-sm">
            <span className="font-medium text-ink">URL du flux</span>
            <input
              name="url"
              required
              placeholder="https://productdata.awin.com/datafeed/download/apikey/…"
              className="mt-1 w-full rounded-lg border border-cream-500 bg-white px-3 py-2 outline-none focus:border-terracotta-500"
            />
            <span className="mt-1 block text-xs text-ink-soft">
              L&apos;URL fournie par la régie, clé d&apos;API incluse. Elle reste privée : elle
              n&apos;apparaît jamais sur le site public. Les fichiers compressés (.gz) sont gérés
              automatiquement.
            </span>
          </label>

          <details className="text-sm">
            <summary className="cursor-pointer font-medium text-ink">
              Options avancées (uniquement si la synchro ne trouve pas les colonnes)
            </summary>

            <div className="mt-4 flex flex-col gap-4">
              <label className="block">
                <span className="font-medium text-ink">Chemin des articles (XML/JSON)</span>
                <input
                  name="itemsPath"
                  placeholder="products.product"
                  className="mt-1 w-full rounded-lg border border-cream-500 bg-white px-3 py-2 outline-none focus:border-terracotta-500"
                />
                <span className="mt-1 block text-xs text-ink-soft">
                  Laissez vide pour une détection automatique.
                </span>
              </label>

              <label className="block">
                <span className="font-medium text-ink">Correspondance des colonnes</span>
                <textarea
                  name="mapping"
                  rows={7}
                  placeholder={"externalId: ref_interne\nprice: montant_ttc\nname: titre_fr"}
                  className="mt-1 w-full rounded-lg border border-cream-500 bg-white px-3 py-2 font-mono text-xs outline-none focus:border-terracotta-500"
                />
                <span className="mt-1 block text-xs text-ink-soft">
                  Une ligne par champ, au format <code>champ: nom_de_colonne</code>. Champs
                  reconnus : externalId, name, price, currency, affiliateUrl, imageUrl,
                  availability.
                </span>
              </label>
            </div>
          </details>

          <div>
            <button className="rounded-full bg-terracotta-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-terracotta-700">
              Enregistrer le flux
            </button>
          </div>
        </form>
      </section>

      <section className="mt-10 rounded-2xl bg-cream-100 p-6">
        <h2 className="font-display text-lg text-ink">Colonnes reconnues automatiquement</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Ces noms sont essayés dans l&apos;ordre pour chaque régie. Si votre annonceur en utilise
          d&apos;autres, indiquez-les dans les options avancées du flux.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-ink-soft">
              <tr>
                <th className="py-2 pr-4">Régie</th>
                <th className="py-2 pr-4">Identifiant</th>
                <th className="py-2 pr-4">Prix</th>
                <th className="py-2">Lien tracké</th>
              </tr>
            </thead>
            <tbody>
              {NETWORKS.map((n) => (
                <tr key={n} className="border-t border-cream-300 align-top">
                  <td className="py-2 pr-4 font-medium text-ink">{NETWORK_LABELS[n]}</td>
                  <td className="py-2 pr-4 font-mono text-ink-soft">
                    {NETWORK_MAPPINGS[n].externalId.slice(0, 3).join(", ")}
                  </td>
                  <td className="py-2 pr-4 font-mono text-ink-soft">
                    {NETWORK_MAPPINGS[n].price.slice(0, 3).join(", ")}
                  </td>
                  <td className="py-2 font-mono text-ink-soft">
                    {NETWORK_MAPPINGS[n].affiliateUrl.slice(0, 2).join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-ink-soft">
          Un prix synchronisé cesse d&apos;être affiché publiquement au-delà de{" "}
          {PRICE_MAX_AGE_HOURS} h sans mise à jour : mieux vaut ne pas afficher de prix
          qu&apos;un prix faux.
        </p>
      </section>
    </div>
  );
}
