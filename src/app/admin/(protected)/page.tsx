import Link from "next/link";
import { db } from "@/lib/db";
import { seedDemoProducts } from "@/app/admin/actions";
import { CATEGORY_LABELS, STATUS_COLORS, STATUS_LABELS } from "@/lib/labels";
import type { Category, ProductStatus } from "@/generated/prisma/client";

const STATUS_OPTIONS: ProductStatus[] = ["SPOTTED", "TESTING", "VALIDATED", "REJECTED"];
const CATEGORY_OPTIONS = Object.keys(CATEGORY_LABELS) as Category[];
const SORT_OPTIONS = [
  { value: "recent", label: "Plus récents" },
  { value: "score", label: "Score de viralité" },
  { value: "margin", label: "Marge estimée" },
] as const;

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    category?: string;
    sort?: string;
    demoSeeded?: string;
  }>;
}) {
  const { status, category, sort, demoSeeded } = await searchParams;

  const [products, totalCount, counts] = await Promise.all([
    db.product.findMany({
      where: {
        status: status ? (status as ProductStatus) : undefined,
        category: category ? (category as Category) : undefined,
      },
      orderBy:
        sort === "score"
          ? { viralScore: "desc" }
          : sort === "margin"
            ? { estimatedMarginPct: "desc" }
            : { createdAt: "desc" },
    }),
    db.product.count(),
    db.product.groupBy({ by: ["status"], _count: true }),
  ]);

  const countFor = (s: ProductStatus) =>
    counts.find((c) => c.status === s)?._count ?? 0;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">Pipeline produit</h1>
          <p className="mt-1 text-ink-soft">
            {products.length} produit{products.length > 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/sources"
            className="rounded-full border border-terracotta-500 px-4 py-2 text-sm font-semibold text-terracotta-700 hover:bg-terracotta-100"
          >
            Sources brutes
          </Link>
          <Link
            href="/admin/produits/nouveau"
            className="rounded-full bg-terracotta-600 px-4 py-2 text-sm font-semibold text-white hover:bg-terracotta-700"
          >
            + Ajouter un produit
          </Link>
        </div>
      </div>

      {demoSeeded && (
        <p className="mt-4 rounded-xl bg-sage-200 px-4 py-3 text-sm text-sage-800">
          {demoSeeded} produits d&apos;exemple créés ou mis à jour — modifiez-les ou
          supprimez-les librement, ce ne sont que des points de départ.
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-terracotta-100 p-5">
        <div>
          <p className="font-semibold text-terracotta-800">
            {totalCount === 0 ? "Catalogue vide" : "Produits d'exemple"}
          </p>
          <p className="mt-1 max-w-xl text-sm text-terracotta-700">
            {totalCount === 0 ? (
              <>
                Générez un jeu de produits d&apos;exemple pour voir le site prendre vie tout de
                suite — entièrement modifiable ensuite.
              </>
            ) : (
              <>
                Régénère les fiches d&apos;exemple avec leur contenu complet (points forts,
                FAQ, photos) pour que les pages produit s&apos;affichent en entier.
                <strong>
                  {" "}
                  Attention : cela écrase vos modifications sur ces fiches d&apos;exemple
                </strong>{" "}
                — vos propres produits ne sont pas touchés.
              </>
            )}
          </p>
        </div>
        <form action={seedDemoProducts}>
          <button className="rounded-full bg-terracotta-600 px-4 py-2 text-sm font-semibold text-white hover:bg-terracotta-700">
            {totalCount === 0
              ? "Générer des produits d'exemple"
              : "Régénérer les produits d'exemple"}
          </button>
        </form>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STATUS_OPTIONS.map((s) => (
          <div key={s} className="rounded-xl bg-cream-100 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
              {STATUS_LABELS[s]}
            </p>
            <p className="mt-1 font-display text-2xl text-ink">{countFor(s)}</p>
          </div>
        ))}
      </div>

      <form className="mt-6 flex flex-wrap gap-3 text-sm">
        <select
          name="status"
          defaultValue={status ?? ""}
          className="rounded-lg border border-cream-500 bg-cream-100 px-3 py-2"
        >
          <option value="">Tous les statuts</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <select
          name="category"
          defaultValue={category ?? ""}
          className="rounded-lg border border-cream-500 bg-cream-100 px-3 py-2"
        >
          <option value="">Toutes les catégories</option>
          {CATEGORY_OPTIONS.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
        <select
          name="sort"
          defaultValue={sort ?? "recent"}
          className="rounded-lg border border-cream-500 bg-cream-100 px-3 py-2"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <button className="rounded-lg bg-cream-300 px-4 py-2 font-medium hover:bg-cream-400">
          Filtrer
        </button>
      </form>

      <div className="mt-6 overflow-hidden rounded-2xl bg-cream-100">
        <table className="w-full text-left text-sm">
          <thead className="bg-cream-300 text-ink-soft">
            <tr>
              <th className="px-4 py-3">Produit</th>
              <th className="px-4 py-3">Catégorie</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Marge</th>
              <th className="px-4 py-3">Ajouté</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-cream-300 hover:bg-cream-200">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/produits/${p.id}`}
                    className="font-semibold text-ink hover:text-terracotta-600"
                  >
                    {p.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-ink-soft">{CATEGORY_LABELS[p.category]}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COLORS[p.status]}`}
                  >
                    {STATUS_LABELS[p.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink-soft">
                  {p.viralScore ?? "—"}
                </td>
                <td className="px-4 py-3 text-ink-soft">
                  {p.estimatedMarginPct != null ? `${p.estimatedMarginPct}%` : "—"}
                </td>
                <td className="px-4 py-3 text-ink-soft">
                  {p.createdAt.toLocaleDateString("fr-FR")}
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-ink-soft">
                  Aucun produit pour ces filtres.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
