import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";
import { FadeIn } from "@/components/ui/FadeIn";
import { CATEGORY_LABELS, SLUG_TO_CATEGORY } from "@/lib/labels";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = SLUG_TO_CATEGORY[slug];
  if (!category) return {};

  const label = CATEGORY_LABELS[category];
  const description = `Notre sélection de produits ${label.toLowerCase()} pour bébé et enfants, repérés et validés par Câlin Kids.`;

  return {
    title: `${label} — Câlin Kids`,
    description,
    openGraph: { title: `${label} — Câlin Kids`, description },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = SLUG_TO_CATEGORY[slug];
  if (!category) notFound();

  const products = await db.product.findMany({
    where: { status: "VALIDATED", category },
    orderBy: [{ isFeatured: "desc" }, { validatedAt: "desc" }],
  });

  return (
    <main>
      <div className="texture-grain bg-cream-200 px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <h1 className="font-display text-4xl text-gold-shimmer">{CATEGORY_LABELS[category]}</h1>
          <p className="mt-2 max-w-xl text-ink-soft">
            Notre sélection validée dans la catégorie {CATEGORY_LABELS[category].toLowerCase()}.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p, i) => (
            <FadeIn key={p.id} delay={Math.min(i * 0.06, 0.3)}>
              <ProductCard product={p} />
            </FadeIn>
          ))}
          {products.length === 0 && (
            <p className="col-span-full rounded-2xl bg-cream-200 p-10 text-center text-ink-soft">
              Aucun produit validé dans cette catégorie pour l&apos;instant.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
