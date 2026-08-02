"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { CATEGORY_LABELS, CATEGORY_SLUGS } from "@/lib/labels";
import type { Category } from "@/generated/prisma/client";

const CATEGORY_TILES: { category: Category; emoji: string }[] = [
  { category: "SOMMEIL", emoji: "🌙" },
  { category: "SECURITE", emoji: "🛡️" },
  { category: "JEU", emoji: "🧸" },
  { category: "EVEIL", emoji: "🌈" },
  { category: "EXTERIEUR", emoji: "🌳" },
  { category: "DOUDOU", emoji: "🐰" },
];

export function CategoryGrid() {
  return (
    <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {CATEGORY_TILES.map(({ category, emoji }, i) => (
        <motion.div
          key={category}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ y: -4 }}
        >
          <Link
            href={`/categories/${CATEGORY_SLUGS[category]}`}
            className="flex flex-col items-center gap-2 rounded-2xl bg-cream-200 p-5 text-center shadow-sm transition-shadow hover:shadow-[0_12px_28px_-12px_rgba(194,86,64,0.35)]"
          >
            <span className="text-3xl">{emoji}</span>
            <span className="text-sm font-semibold text-ink">{CATEGORY_LABELS[category]}</span>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
