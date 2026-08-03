"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { CATEGORY_LABELS, CATEGORY_SLUGS } from "@/lib/labels";
import type { Product } from "@/generated/prisma/client";

export function ProductCard({ product }: { product: Product }) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-cream-300 bg-cream-100 shadow-[0_2px_10px_-4px_rgba(54,42,34,0.08)] transition-shadow duration-300 hover:shadow-[0_20px_40px_-16px_rgba(0,0,0,0.15)]"
    >
      <Link href={`/produits/${product.slug}`} className="block">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-cream-300">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover saturate-[0.85] brightness-[1.02] transition duration-500 group-hover:scale-105"
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center font-display text-cream-600">
              Câlin Kids
            </div>
          )}
          <span className="absolute left-3 top-3 rounded-full bg-cream-100/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-terracotta-700 backdrop-blur-sm">
            {CATEGORY_LABELS[product.category]}
          </span>
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link href={`/produits/${product.slug}`}>
          <h3 className="font-display text-lg leading-tight text-ink transition-colors hover:text-terracotta-600">
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
            target={product.affiliateUrl ? "_blank" : undefined}
            rel={product.affiliateUrl ? "noopener noreferrer sponsored" : undefined}
            className="btn-shine bg-terracotta-600 px-4 py-2 text-xs text-white transition-colors hover:bg-terracotta-700"
          >
            {product.affiliateUrl ? "Voir l'offre" : "Bientôt dispo"}
          </a>
        </div>
      </div>
    </motion.div>
  );
}
