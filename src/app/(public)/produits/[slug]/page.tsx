import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";
import { CATEGORY_LABELS, CATEGORY_SLUGS } from "@/lib/labels";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await db.product.findUnique({ where: { slug } });
  if (!product || product.status !== "VALIDATED") notFound();

  const alternatives = await db.product.findMany({
    where: {
      status: "VALIDATED",
      category: product.category,
      id: { not: product.id },
    },
    take: 3,
  });

  return (
    <main className="mx-auto max-w-5xl px-6 py-14">
      <nav className="text-sm text-ink-soft">
        <Link href={`/categories/${CATEGORY_SLUGS[product.category]}`} className="hover:text-terracotta-600">
          {CATEGORY_LABELS[product.category]}
        </Link>
      </nav>

      <div className="mt-4 grid grid-cols-1 gap-10 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-cream-300">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover saturate-[0.85]"
            />
          ) : (
            <div className="flex h-full items-center justify-center font-display text-cream-600">
              Câlin Kids
            </div>
          )}
        </div>

        <div>
          <h1 className="font-display text-3xl text-ink">{product.name}</h1>
          <div className="mt-2 flex items-center gap-3 text-sm text-ink-soft">
            {product.rating != null && <span className="text-gold-600">★ {product.rating.toFixed(1)}</span>}
            {product.estimatedPriceCents != null && (
              <span>{(product.estimatedPriceCents / 100).toFixed(2)} €</span>
            )}
          </div>

          {product.description && (
            <p className="mt-5 text-ink-soft">{product.description}</p>
          )}

          {product.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-cream-300 px-3 py-1 text-xs text-ink-soft">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <a
            href={`/api/clic/${product.id}?source=fiche-produit`}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="mt-8 inline-block rounded-full bg-terracotta-600 px-6 py-3 font-semibold text-white hover:bg-terracotta-700"
          >
            Voir l&apos;offre
          </a>
          <p className="mt-2 text-xs text-ink-soft">
            Lien affilié — nous pouvons percevoir une commission sans surcoût pour vous.
          </p>
        </div>
      </div>

      {alternatives.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-xl text-ink">Autres pépites {CATEGORY_LABELS[product.category].toLowerCase()}</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {alternatives.map((alt) => (
              <ProductCard key={alt.id} product={alt} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
