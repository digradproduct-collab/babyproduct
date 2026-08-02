import { db } from "@/lib/db";
import { addRawSource, analyzeRawSource, discardRawSource } from "@/app/admin/actions";
import { PLATFORM_LABELS } from "@/lib/labels";
import type { SourcePlatform } from "@/generated/prisma/client";

const PLATFORM_OPTIONS = Object.keys(PLATFORM_LABELS) as SourcePlatform[];

export default async function SourcesPage() {
  const sources = await db.rawSource.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const pending = sources.filter((s) => s.status === "PENDING");
  const processed = sources.filter((s) => s.status !== "PENDING");

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Sources repérées</h1>
      <p className="mt-1 text-ink-soft">
        Collez ici un lien + les métriques observées sur un réseau social. Le job IA (manuel
        ou planifié) analysera chaque source pour proposer un produit candidat noté — jamais
        publié sans validation humaine.
      </p>

      <section className="mt-6 rounded-2xl bg-cream-100 p-6">
        <h2 className="font-display text-lg text-ink">Nouvelle source</h2>
        <form action={addRawSource} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm sm:col-span-2">
            Lien
            <input
              name="url"
              required
              placeholder="https://www.tiktok.com/..."
              className="rounded-lg border border-cream-500 bg-white px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Plateforme
            <select name="platform" className="rounded-lg border border-cream-500 bg-white px-3 py-2">
              {PLATFORM_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {PLATFORM_LABELS[p]}
                </option>
              ))}
            </select>
          </label>
          <div />
          <label className="flex flex-col gap-1 text-sm sm:col-span-2">
            Légende / description observée
            <textarea
              name="caption"
              rows={2}
              className="rounded-lg border border-cream-500 bg-white px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Vues observées
            <input name="observedViews" type="number" className="rounded-lg border border-cream-500 bg-white px-3 py-2" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Likes observés
            <input name="observedLikes" type="number" className="rounded-lg border border-cream-500 bg-white px-3 py-2" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Commentaires observés
            <input name="observedComments" type="number" className="rounded-lg border border-cream-500 bg-white px-3 py-2" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Partages observés
            <input name="observedShares" type="number" className="rounded-lg border border-cream-500 bg-white px-3 py-2" />
          </label>
          <div className="sm:col-span-2">
            <button className="rounded-full bg-terracotta-600 px-5 py-2.5 font-semibold text-white hover:bg-terracotta-700">
              Ajouter la source
            </button>
          </div>
        </form>
      </section>

      <section className="mt-6">
        <h2 className="font-display text-lg text-ink">En attente d&apos;analyse ({pending.length})</h2>
        <div className="mt-3 flex flex-col gap-3">
          {pending.map((s) => (
            <div key={s.id} className="rounded-xl bg-cream-100 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase text-ink-soft">
                    {PLATFORM_LABELS[s.platform]}
                  </p>
                  <a
                    href={s.url}
                    target="_blank"
                    className="font-medium text-ink hover:text-terracotta-600 break-all"
                  >
                    {s.url}
                  </a>
                  {s.caption && <p className="mt-1 text-sm text-ink-soft">{s.caption}</p>}
                  <p className="mt-1 text-xs text-ink-soft">
                    {s.observedViews ?? "—"} vues · {s.observedLikes ?? "—"} likes ·{" "}
                    {s.observedComments ?? "—"} commentaires · {s.observedShares ?? "—"} partages
                  </p>
                </div>
                <div className="flex gap-2">
                  <form action={analyzeRawSource.bind(null, s.id)}>
                    <button className="rounded-full bg-sage-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sage-700">
                      Analyser avec l&apos;IA
                    </button>
                  </form>
                  <form action={discardRawSource.bind(null, s.id)}>
                    <button className="rounded-full border border-cream-500 px-4 py-2 text-sm font-semibold text-ink-soft hover:border-berry-500 hover:text-berry-600">
                      Écarter
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
          {pending.length === 0 && (
            <p className="rounded-xl bg-cream-100 p-4 text-ink-soft">
              Aucune source en attente.
            </p>
          )}
        </div>
      </section>

      {processed.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display text-lg text-ink">Traitées</h2>
          <div className="mt-3 flex flex-col gap-2">
            {processed.map((s) => (
              <div key={s.id} className="rounded-xl bg-cream-100/70 p-3 text-sm text-ink-soft">
                <span className="font-medium text-ink">{s.status === "PROCESSED" ? "Analysée" : "Écartée"}</span>{" "}
                — {s.url}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
