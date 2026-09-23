"use client";

import { useState } from "react";

export function CatMascot({ message }: { message: string }) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="fixed right-4 bottom-4 z-50 hidden justify-end sm:flex sm:max-w-xs">
      <div className="relative flex-1 rounded-2xl bg-white p-3 pr-6 text-sm text-gray-800 shadow-lg ring-1 ring-black/5 sm:flex-none">
        <button
          onClick={() => setVisible(false)}
          aria-label="閉じる"
          className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-300 text-xs text-gray-700 hover:bg-gray-400 sm:-top-2 sm:-right-2"
        >
          ×
        </button>
        {message}
      </div>
    </div>
  );
}
