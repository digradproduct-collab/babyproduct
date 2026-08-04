"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Produits" },
  { href: "/admin/sources", label: "Sources" },
  { href: "/admin/flux", label: "Flux régies" },
  { href: "/admin/analytics", label: "Analytics" },
];

/** Navigation interne : l'onglet courant doit être lisible sans réfléchir. */
export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 text-sm font-medium">
      {LINKS.map(({ href, label }) => {
        const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`rounded-md px-3 py-1.5 transition-colors duration-150 ${
              active
                ? "bg-terracotta-100 text-terracotta-800"
                : "text-ink-soft hover:bg-cream-200 hover:text-ink"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
