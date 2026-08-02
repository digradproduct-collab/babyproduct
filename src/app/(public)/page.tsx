import Link from "next/link";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";
import { NewsletterForm } from "@/components/NewsletterForm";
import { CATEGORY_LABELS, CATEGORY_SLUGS } from "@/lib/labels";
import type { Category } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

const CATEGORY_TILES: { category: Category; emoji: string }[] = [
  { category: "SOMMEIL", emoji: "🌙" },
  { category: "SECURITE", emoji: "🛡️" },
  { category: "JEU", emoji: "🧸" },
  { category: "EVEIL", emoji: "🌈" },
  { category: "EXTERIEUR", emoji: "🌳" },
  { category: "DOUDOU", emoji: "🐰" },
];

export default async function HomePage() {
  const topProducts = await db.product.findMany({
    where: { status: "VALIDATED" },
    orderBy: [{ isFeatured: "desc" }, { validatedAt: "desc" }],
    take: 8,
  });

  return (
    <main>
      <section className="relative overflow-hidden bg-cream-200 px-6 py-20">
        <div
          aria-hidden
          className="absolute -left-24 -top-24 h-72 w-72 bg-sage-300/50"
          style={{ borderRadius: "var(--radius-blob)" }}
        />
        <div
          aria-hidden
          className="absolute -right-16 top-10 h-56 w-56 bg-terracotta-300/40"
          style={{ borderRadius: "var(--radius-blob)" }}
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <h1 className="font-display text-4xl leading-tight text-ink sm:text-6xl">
            Les pépites bébé & enfants du moment,{" "}
            <span className="text-terracotta-600">repérées pour vous</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-ink-soft">
            Câlin Kids traque les produits qui font le buzz, les teste avant de les
            recommander, et ne garde que ceux qui méritent vraiment une place chez vous.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="#top-produits"
              className="rounded-full bg-terracotta-600 px-6 py-3 font-semibold text-white hover:bg-terracotta-700"
            >
              Voir le top de la semaine
            </Link>
            <Link
              href="#newsletter"
              className="rounded-full border border-terracotta-500 px-6 py-3 font-semibold text-terracotta-700 hover:bg-terracotta-100"
            >
              Recevoir le top 5
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <h2 className="text-center font-display text-2xl text-ink">Explorer par catégorie</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {CATEGORY_TILES.map(({ category, emoji }) => (
            <Link
              key={category}
              href={`/categories/${CATEGORY_SLUGS[category]}`}
              className="flex flex-col items-center gap-2 rounded-2xl bg-cream-200 p-5 text-center transition hover:-translate-y-1 hover:bg-cream-300"
            >
              <span className="text-3xl">{emoji}</span>
              <span className="text-sm font-semibold text-ink">{CATEGORY_LABELS[category]}</span>
            </Link>
          ))}
        </div>
      </section>

      <section id="top-produits" className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-2xl text-ink">Top produits de la semaine</h2>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {topProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
          {topProducts.length === 0 && (
            <p className="col-span-full rounded-2xl bg-cream-200 p-10 text-center text-ink-soft">
              Les premiers produits validés arrivent très bientôt !
            </p>
          )}
        </div>
      </section>

      <section id="newsletter" className="bg-sage-100 px-6 py-16">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
          <h2 className="font-display text-2xl text-ink">Le top 5 de la semaine, dans votre boîte mail</h2>
          <p className="max-w-lg text-ink-soft">
            Chaque semaine, recevez notre sélection des 5 produits bébé & enfants les plus
            plébiscités du moment.
          </p>
          <NewsletterForm />
        </div>
      </section>
    </main>
  );
}
