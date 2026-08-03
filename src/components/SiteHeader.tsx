import Link from "next/link";
import { CATEGORY_LABELS, CATEGORY_SLUGS } from "@/lib/labels";
import type { Category } from "@/generated/prisma/client";

const NAV_CATEGORIES: Category[] = ["SOMMEIL", "SECURITE", "JEU", "EVEIL", "EXTERIEUR", "DOUDOU"];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-cream-400/60 bg-cream-100/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="font-display text-2xl text-gold-shimmer">
          Câlin Kids
        </Link>
        <nav className="hidden flex-wrap gap-5 text-sm font-medium text-ink-soft md:flex">
          {NAV_CATEGORIES.map((c) => (
            <Link
              key={c}
              href={`/categories/${CATEGORY_SLUGS[c]}`}
              className="group relative py-1 hover:text-terracotta-600"
            >
              {CATEGORY_LABELS[c]}
              <span className="absolute inset-x-0 -bottom-0.5 h-px scale-x-0 bg-terracotta-500 transition-transform duration-300 group-hover:scale-x-100" />
            </Link>
          ))}
        </nav>
        <Link
          href="/#newsletter"
          className="btn-shine bg-terracotta-600 px-4 py-2 text-xs text-white hover:bg-terracotta-700"
        >
          Newsletter
        </Link>
      </div>
    </header>
  );
}
