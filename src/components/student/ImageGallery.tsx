"use client";

import { useState } from "react";

export function ImageGallery({ imageUrls }: { imageUrls: string[] }) {
  const [selected, setSelected] = useState<string | null>(null);

  if (imageUrls.length === 0) return null;

  return (
    <>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {imageUrls.map((url) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={url}
            src={url}
            alt=""
            onClick={() => setSelected(url)}
            className="w-full cursor-pointer rounded-md border border-gray-100 transition-opacity hover:opacity-90"
          />
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelected(null)}
        >
          <button
            type="button"
            onClick={() => setSelected(null)}
            aria-label="閉じる"
            className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-lg text-gray-800 hover:bg-white"
          >
            ×
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={selected}
            alt=""
            onClick={(e) => e.stopPropagation()}
            className="max-h-full max-w-full rounded-md object-contain"
          />
        </div>
      )}
    </>
  );
}
