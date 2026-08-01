import Image from "next/image";
import Link from "next/link";
import { CATEGORY_LABELS, CATEGORY_SLUGS } from "@/lib/labels";
import type { Product } from "@/generated/prisma/client";

export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl bg-cream-100 transition hover:-translate-y-1 hover:shadow-lg">
      <Link href={`/produits/${product.slug}`} className="block">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-cream-300">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover saturate-[0.85] brightness-[1.02] transition group-hover:scale-105"
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center font-display text-cream-600">
              Câlin Kids
            </div>
          )}
          <span className="absolute left-3 top-3 rounded-full bg-cream-100/90 px-3 py-1 text-xs font-semibold text-terracotta-700">
            {CATEGORY_LABELS[product.category]}
          </span>
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link href={`/produits/${product.slug}`}>
          <h3 className="font-display text-lg leading-tight text-ink hover:text-terracotta-600">
            {product.name}
          </h3>
        </Link>
        {product.description && (
          <p className="line-clamp-2 text-sm text-ink-soft">{product.description}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-sm text-ink-soft">
            {product.rating != null && (
              <span className="text-gold-600">★ {product.rating.toFixed(1)}</span>
            )}
            {product.estimatedPriceCents != null && (
              <span>{(product.estimatedPriceCents / 100).toFixed(2)} €</span>
            )}
          </div>
          <a
            href={`/api/clic/${product.id}?source=${CATEGORY_SLUGS[product.category]}`}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="rounded-full bg-terracotta-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-terracotta-700"
          >
            Voir l&apos;offre
          </a>
        </div>
      </div>
    </div>
  );
}
