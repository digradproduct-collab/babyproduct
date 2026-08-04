"use client";

import { useState } from "react";
import { ChevronIcon } from "@/components/ui/Icon";
import type { FaqItem } from "@/lib/productContent";

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="flex flex-col gap-2">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={item.question} className="rounded-xl bg-cream-200">
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 rounded-xl px-4 py-3.5 text-left font-semibold text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              aria-expanded={isOpen}
            >
              {item.question}
              <ChevronIcon
                className={`h-4 w-4 shrink-0 text-gold-800 transition-transform duration-300 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isOpen && (
              <p className="max-w-[70ch] px-4 pb-4 text-sm leading-relaxed text-ink-soft">
                {item.answer}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
