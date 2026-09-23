"use client";

import { useState } from "react";
import Link from "next/link";

const STATUS_BADGE: Record<string, string> = {
  NOT_STARTED: "⬜ 未着手",
  IN_PROGRESS: "🟡 進行中",
  COMPLETED: "✅ 完了",
};

type TaskItem = { id: string; title: string; status: string };

export function SectionAccordion({
  section,
}: {
  section: {
    id: string;
    title: string;
    description: string | null;
    tasks: TaskItem[];
    completedCount: number;
  };
}) {
  const [open, setOpen] = useState(false);
  const isSectionComplete =
    section.tasks.length > 0 && section.completedCount === section.tasks.length;

  return (
    <div className="rounded-xl bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between p-5 text-left hover:bg-brown-50"
      >
        <div>
          <h2 className="font-semibold text-gray-800">{section.title}</h2>
          {section.description && (
            <p className="mt-1 text-sm text-gray-500">{section.description}</p>
          )}
          <p className="mt-2 flex items-center gap-2 text-xs text-gray-500">
            {isSectionComplete && (
              <span className="rounded-full bg-green-100 px-2 py-0.5 font-semibold text-green-700">
                完了
              </span>
            )}
            {section.completedCount} / {section.tasks.length} 課題完了
          </p>
        </div>
        <span
          aria-hidden="true"
          className={`shrink-0 text-sm text-brown-600 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </button>

      {open && (
        <div className="border-t border-gray-100 p-3">
          {section.tasks.length === 0 ? (
            <p className="p-2 text-xs text-gray-400">課題がまだありません。</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {section.tasks.map((task) => (
                <li key={task.id}>
                  <Link
                    href={`/student/tasks/${task.id}`}
                    className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 text-[15px] hover:bg-brown-50"
                  >
                    <span className="text-black">{task.title}</span>
                    <span className="text-[13px] text-black">
                      {STATUS_BADGE[task.status]}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
