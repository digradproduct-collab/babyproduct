"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { CATEGORY_LABELS, CATEGORY_SLUGS } from "@/lib/labels";
import { CATEGORY_ICONS } from "@/components/ui/Icon";
import type { Category } from "@/generated/prisma/client";

const NAV_CATEGORIES: Category[] = [
  "SOMMEIL",
  "SECURITE",
  "JEU",
  "EVEIL",
  "EXTERIEUR",
  "DOUDOU",
];

export function CategoryGrid() {
  return (
    <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {NAV_CATEGORIES.map((category, i) => {
        const Icon = CATEGORY_ICONS[category];
        return (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link
              href={`/categories/${CATEGORY_SLUGS[category]}`}
              className="group flex flex-col items-center gap-3 rounded-xl bg-cream-200 px-4 py-6 text-center transition-colors duration-300 hover:bg-terracotta-100"
            >
              <Icon className="h-7 w-7 text-gold-800 transition-transform duration-300 group-hover:-translate-y-0.5" />
              <span className="text-sm font-semibold text-ink">
                {CATEGORY_LABELS[category]}
              </span>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
