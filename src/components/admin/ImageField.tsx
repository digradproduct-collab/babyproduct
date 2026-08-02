"use client";

import Image from "next/image";
import { useState } from "react";

export function ImageField({ currentImageUrl }: { currentImageUrl?: string | null }) {
  const [preview, setPreview] = useState<string | null>(currentImageUrl ?? null);

  return (
    <div className="flex flex-col gap-2 text-sm sm:col-span-2">
      <span>Photo du produit</span>
      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-cream-300">
          {preview && (
            <Image src={preview} alt="Aperçu" fill className="object-cover" unoptimized />
          )}
        </div>
        <input
          name="imageFile"
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setPreview(URL.createObjectURL(file));
          }}
          className="text-sm"
        />
      </div>
      <label className="mt-1 flex flex-col gap-1 text-xs text-ink-soft">
        ou URL externe (utilisée si aucune photo n&apos;est envoyée ci-dessus)
        <input
          name="imageUrl"
          defaultValue={currentImageUrl ?? ""}
          className="rounded-lg border border-cream-500 bg-white px-3 py-2 text-sm text-ink"
        />
      </label>
    </div>
  );
}
