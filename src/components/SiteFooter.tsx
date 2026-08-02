import Link from "next/link";
import { CATEGORY_LABELS, CATEGORY_SLUGS } from "@/lib/labels";
import type { Category } from "@/generated/prisma/client";

const ALL_CATEGORIES = Object.keys(CATEGORY_LABELS).filter(
  (c) => c !== "AUTRE",
) as Category[];

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-cream-400 bg-cream-200">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div>
            <p className="font-display text-xl text-terracotta-700">Câlin Kids</p>
            <p className="mt-2 text-sm text-ink-soft">
              On repère pour vous les produits bébé & enfants les plus appréciés du moment.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">Catégories</p>
            <ul className="mt-2 flex flex-col gap-1.5 text-sm text-ink-soft">
              {ALL_CATEGORIES.map((c) => (
                <li key={c}>
                  <Link href={`/categories/${CATEGORY_SLUGS[c]}`} className="hover:text-terracotta-600">
                    {CATEGORY_LABELS[c]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">Informations</p>
            <ul className="mt-2 flex flex-col gap-1.5 text-sm text-ink-soft">
              <li>
                <Link href="/mentions-legales" className="hover:text-terracotta-600">
                  Mentions légales & affiliation
                </Link>
              </li>
              {process.env.NEXT_PUBLIC_SHOW_PIPELINE === "true" && (
                <li>
                  <Link href="/pipeline" className="hover:text-terracotta-600">
                    Pipeline (transparence)
                  </Link>
                </li>
              )}
              <li>
                <Link href="/admin/login" className="hover:text-terracotta-600">
                  Espace interne
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 rounded-2xl bg-cream-100 p-4 text-xs text-ink-soft">
          Câlin Kids est un site d&apos;affiliation : certains liens « Voir l&apos;offre » sont des
          liens affiliés. Cela signifie que nous pouvons percevoir une commission sur les achats
          réalisés via ces liens, sans surcoût pour vous. Cela ne change jamais notre sélection,
          qui reste basée sur la popularité réelle des produits.
        </div>

        <p className="mt-6 text-xs text-ink-soft">
          © {new Date().getFullYear()} Câlin Kids. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
