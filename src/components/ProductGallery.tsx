"use client";

import Image from "next/image";
import { useState } from "react";

export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-cream-300 shadow-[0_20px_50px_-24px_rgba(54,42,34,0.35)]">
        <div className="flex h-full items-center justify-center font-display text-cream-600">
          Câlin Kids
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-cream-300 shadow-[0_20px_50px_-24px_rgba(54,42,34,0.35)]">
        <Image
          src={images[active]}
          alt={alt}
          fill
          priority
          sizes="(min-width: 768px) 40vw, 100vw"
          className="object-cover saturate-[0.85]"
        />
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2">
          {images.map((img, i) => (
            <button
              key={img}
              type="button"
              onClick={() => setActive(i)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-cream-300 transition ${
                active === i ? "ring-2 ring-terracotta-600" : "opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={img} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
