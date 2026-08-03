"use client";

import { motion } from "motion/react";
import { MagneticButton } from "@/components/ui/MagneticButton";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  return (
    <section className="texture-grain relative overflow-hidden bg-cream-200 px-6 py-24 sm:py-28">
      <motion.div
        aria-hidden
        className="absolute -left-24 -top-24 h-72 w-72 bg-sage-300/50"
        style={{ borderRadius: "var(--radius-blob)" }}
        animate={{ y: [0, 18, 0], rotate: [0, 6, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute -right-16 top-10 h-56 w-56 bg-terracotta-300/40"
        style={{ borderRadius: "var(--radius-blob)" }}
        animate={{ y: [0, -16, 0], rotate: [0, -8, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />

      <div className="relative mx-auto max-w-3xl text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-cream-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-terracotta-700 shadow-sm"
        >
          La sélection de la semaine
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.1, ease: EASE }}
          className="font-display text-4xl leading-tight text-ink sm:text-6xl"
        >
          Les pépites bébé &amp; enfants du moment,{" "}
          <span className="text-gold-shimmer">repérées pour vous</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.22, ease: EASE }}
          className="mx-auto mt-5 max-w-xl text-lg text-ink-soft"
        >
          Câlin Kids traque les produits qui font le buzz, les teste avant de les
          recommander, et ne garde que ceux qui méritent vraiment une place chez vous.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.34, ease: EASE }}
          className="mt-8 flex flex-wrap justify-center gap-3"
        >
          <MagneticButton
            as="a"
            href="#top-produits"
            className="btn-shine inline-block bg-terracotta-600 px-6 py-3 text-white shadow-lg transition-colors hover:bg-terracotta-700"
          >
            Voir le top de la semaine
          </MagneticButton>
          <MagneticButton
            as="a"
            href="#newsletter"
            className="btn-shine inline-block border border-terracotta-500 px-6 py-3 text-terracotta-800 transition-colors hover:bg-terracotta-100"
          >
            Recevoir le top 5
          </MagneticButton>
        </motion.div>
      </div>
    </section>
  );
}
