"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { CATEGORY_LABELS, CATEGORY_SLUGS } from "@/lib/labels";
import { Rating } from "@/components/ui/Rating";
import { publicPrice } from "@/lib/price";
import { buyAction } from "@/lib/fulfillment";
import type { Product } from "@/generated/prisma/client";

export function ProductCard({ product }: { product: Product }) {
  const price = publicPrice(product);
  const priceLabel = price.kind === "stale" || price.kind === "none" ? null : price.label;
  const action = buyAction(product);

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="group flex h-full flex-col overflow-hidden rounded-xl bg-cream-100 shadow-[0_1px_2px_rgba(17,24,39,0.06),0_8px_24px_-12px_rgba(17,24,39,0.18)] transition-shadow duration-300 hover:shadow-[0_2px_4px_rgba(17,24,39,0.06),0_24px_48px_-20px_rgba(17,24,39,0.28)]"
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
          <span className="absolute left-3 top-3 rounded-md bg-cream-100/95 px-2.5 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.06em] text-gold-800">
            {CATEGORY_LABELS[product.category]}
          </span>
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <Link href={`/produits/${product.slug}`}>
          <h3 className="font-display text-base leading-snug text-ink transition-colors group-hover:text-gold-800">
            {product.name}
          </h3>
        </Link>
        {product.description && (
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink-soft">
            {product.description}
          </p>
        )}

        {product.rating != null && (
          <div className="mt-3">
            <Rating value={product.rating} />
          </div>
        )}

        {/* mt-auto cale la ligne prix + action en bas : les cartes d'une même
            rangée alignent leur bouton quelle que soit la longueur du titre. */}
        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          {priceLabel ? (
            <span className="font-display text-lg tabular-nums text-ink">{priceLabel}</span>
          ) : (
            <span />
          )}
          {action.kind === "out-of-stock" ? (
            <span className="btn-shine shrink-0 cursor-not-allowed bg-cream-300 px-4 py-2 text-xs text-ink-soft">
              Rupture
            </span>
          ) : (
            <a
              href={`/api/clic/${product.id}?source=${CATEGORY_SLUGS[product.category]}`}
              target={action.kind === "affiliate" ? "_blank" : undefined}
              rel={action.kind === "affiliate" ? "noopener noreferrer sponsored" : undefined}
              className="btn-shine shrink-0 bg-terracotta-600 px-4 py-2 text-xs transition-colors hover:bg-terracotta-700"
            >
              {action.kind === "soon" ? "Bientôt dispo" : action.label}
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
