"use client";

import { useEffect, useState } from "react";

type GalleryImage = { url: string; title: string | null };

export function ImageGallery({ images }: { images: GalleryImage[] }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const showPrev = () =>
    setSelectedIndex((i) =>
      i === null ? null : (i - 1 + images.length) % images.length
    );
  const showNext = () =>
    setSelectedIndex((i) => (i === null ? null : (i + 1) % images.length));

  useEffect(() => {
    if (selectedIndex === null) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setSelectedIndex(null);
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIndex, images.length]);

  if (images.length === 0) return null;

  const selected = selectedIndex !== null ? images[selectedIndex] : null;

  return (
    <>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {images.map((image, index) => (
          <div key={image.url} className="flex flex-col gap-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.url}
              alt={image.title ?? ""}
              onClick={() => setSelectedIndex(index)}
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
          onClick={() => setSelectedIndex(null)}
        >
          <button
            type="button"
            onClick={() => setSelectedIndex(null)}
            aria-label="閉じる"
            className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-lg text-gray-800 hover:bg-white"
          >
            ×
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  showPrev();
                }}
                aria-label="前の画像"
                className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl text-gray-800 hover:bg-white sm:left-4"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  showNext();
                }}
                aria-label="次の画像"
                className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl text-gray-800 hover:bg-white sm:right-4"
              >
                ›
              </button>
            </>
          )}

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
          {images.length > 1 && (
            <p className="text-xs text-white/70">
              {(selectedIndex ?? 0) + 1} / {images.length}
            </p>
          )}
        </div>
      )}
    </>
  );
}
