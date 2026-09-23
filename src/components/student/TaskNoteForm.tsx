"use client";

import { useActionState } from "react";
import { saveTaskNote } from "@/app/actions/student";

export function TaskNoteForm({
  taskId,
  note,
}: {
  taskId: string;
  note: string;
}) {
  const saveWithTaskId = saveTaskNote.bind(null, taskId);
  const [state, formAction, isPending] = useActionState(
    saveWithTaskId,
    undefined
  );

  return (
    <form
      action={formAction}
      className="mt-6 flex flex-col gap-2 border-t border-gray-100 pt-6"
    >
      <label htmlFor="note" className="text-sm font-semibold text-gray-700">
        感想・学んだこと
      </label>
      <textarea
        id="note"
        name="note"
        defaultValue={note}
        rows={4}
        placeholder="この課題で学んだことや感想を書いてみましょう"
        className="rounded-md border border-gray-300 px-3 py-2 text-sm"
      />
      {state?.success && (
        <p className="text-sm text-green-600">保存しました</p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="self-start rounded-md bg-brown-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brown-600 disabled:opacity-50"
      >
        {isPending ? "保存中..." : "保存"}
      </button>
    </form>
  );
}
