"use client";

import { useState } from "react";

type GalleryImage = { url: string; title: string | null };

export function ImageGallery({ images }: { images: GalleryImage[] }) {
  const [selected, setSelected] = useState<GalleryImage | null>(null);

  if (images.length === 0) return null;

  return (
    <>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {images.map((image) => (
          <div key={image.url} className="flex flex-col gap-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.url}
              alt={image.title ?? ""}
              onClick={() => setSelected(image)}
              className="w-full cursor-pointer rounded-md border border-gray-100 transition-opacity hover:opacity-90"
            />
            {image.title && (
              <p className="text-sm text-gray-600">{image.title}</p>
            )}
          </div>
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-black/80 p-4"
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
            src={selected.url}
            alt={selected.title ?? ""}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-full rounded-md object-contain"
          />
          {selected.title && (
            <p className="text-sm text-white">{selected.title}</p>
          )}
        </div>
      )}
    </>
  );
}
