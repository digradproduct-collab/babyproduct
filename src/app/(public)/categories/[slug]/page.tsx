import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";
import { CATEGORY_LABELS, SLUG_TO_CATEGORY } from "@/lib/labels";

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
    <main className="mx-auto max-w-6xl px-6 py-14">
      <h1 className="font-display text-3xl text-ink">{CATEGORY_LABELS[category]}</h1>
      <p className="mt-2 text-ink-soft">
        Notre sélection validée dans la catégorie {CATEGORY_LABELS[category].toLowerCase()}.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
        {products.length === 0 && (
          <p className="col-span-full rounded-2xl bg-cream-200 p-10 text-center text-ink-soft">
            Aucun produit validé dans cette catégorie pour l&apos;instant.
          </p>
        )}
      </div>
    </main>
  );
}
