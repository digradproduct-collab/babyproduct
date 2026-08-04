"use client";

import { motion } from "motion/react";
import { MagneticButton } from "@/components/ui/MagneticButton";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-cream-200 px-6 py-28 sm:py-36">
      <div className="relative mx-auto max-w-3xl text-center">
        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: EASE }}
          className="text-balance font-display text-[2.75rem] leading-[1.05] tracking-[-0.03em] text-ink sm:text-7xl"
        >
          Les pépites bébé &amp; enfants du moment,{" "}
          <span className="text-gold-shimmer">repérées pour vous</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.12, ease: EASE }}
          className="mx-auto mt-6 max-w-[60ch] text-lg leading-relaxed text-ink-soft"
        >
          Câlin Kids traque les produits qui font le buzz, les teste avant de les
          recommander, et ne garde que ceux qui méritent vraiment une place chez vous.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.24, ease: EASE }}
          className="mt-10 flex flex-wrap justify-center gap-3"
        >
          <MagneticButton
            as="a"
            href="#top-produits"
            className="btn-shine inline-block bg-terracotta-600 px-6 py-3 shadow-lg transition-colors hover:bg-terracotta-700"
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
