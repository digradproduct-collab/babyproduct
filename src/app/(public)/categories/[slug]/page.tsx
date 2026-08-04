import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";
import { FadeIn } from "@/components/ui/FadeIn";
import { CATEGORY_ICONS } from "@/components/ui/Icon";
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

  const Icon = CATEGORY_ICONS[category];

  return (
    <main>
      <div className="bg-cream-200 px-6 py-20">
        <div className="mx-auto flex max-w-6xl items-start gap-5">
          <span className="mt-1 flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-cream-100">
            <Icon className="h-7 w-7 text-gold-800" />
          </span>
          <div>
            <h1 className="font-display text-5xl leading-none tracking-[-0.03em] text-ink">
              {CATEGORY_LABELS[category]}
            </h1>
            <p className="mt-3 max-w-[55ch] leading-relaxed text-ink-soft">
              Notre sélection validée dans la catégorie{" "}
              {CATEGORY_LABELS[category].toLowerCase()}.
            </p>
            <p className="mt-4 text-sm font-medium tabular-nums text-gold-800">
              {products.length} produit{products.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-16">
        {products.length === 0 ? (
          <div className="rounded-xl bg-cream-200 px-6 py-16 text-center">
            <Icon className="mx-auto h-9 w-9 text-cream-600" />
            <p className="mt-4 font-display text-xl text-ink">
              Rien à recommander ici pour l&apos;instant
            </p>
            <p className="mx-auto mt-2 max-w-[45ch] text-sm leading-relaxed text-ink-soft">
              Nous n&apos;ajoutons un produit qu&apos;après l&apos;avoir testé. Cette catégorie se
              remplira dès qu&apos;une trouvaille passera le test.
            </p>
            <Link
              href="/"
              className="btn-shine mt-6 inline-block bg-terracotta-600 px-5 py-2.5 text-xs transition-colors hover:bg-terracotta-700"
            >
              Voir toute la sélection
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p, i) => (
              <FadeIn key={p.id} delay={Math.min(i * 0.06, 0.3)}>
                <ProductCard product={p} />
              </FadeIn>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
