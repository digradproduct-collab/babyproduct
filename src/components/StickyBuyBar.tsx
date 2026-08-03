"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export function StickyBuyBar({
  name,
  priceLabel,
  ctaUrl,
  hasOffer = true,
}: {
  name: string;
  priceLabel: string | null;
  ctaUrl: string;
  hasOffer?: boolean;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-cream-400 bg-cream-100/95 px-4 py-3 backdrop-blur"
        >
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">{name}</p>
              {priceLabel && <p className="text-xs text-ink-soft">{priceLabel}</p>}
            </div>
            <a
              href={ctaUrl}
              target={hasOffer ? "_blank" : undefined}
              rel={hasOffer ? "noopener noreferrer sponsored" : undefined}
              className="btn-shine shrink-0 bg-terracotta-600 px-5 py-2.5 text-sm text-white hover:bg-terracotta-700"
            >
              {hasOffer ? "Voir l'offre" : "Bientôt dispo"}
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
