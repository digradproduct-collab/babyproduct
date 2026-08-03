"use client";

import { useState } from "react";
import type { FaqItem } from "@/lib/productContent";

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="flex flex-col gap-2">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={item.question} className="rounded-xl border border-cream-300 bg-cream-100">
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left font-semibold text-ink"
              aria-expanded={isOpen}
            >
              {item.question}
              <span className="text-terracotta-600">{isOpen ? "−" : "+"}</span>
            </button>
            {isOpen && (
              <p className="px-4 pb-4 text-sm text-ink-soft">{item.answer}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
