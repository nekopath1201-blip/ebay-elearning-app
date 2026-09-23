"use client";

import { useActionState, useEffect, useState } from "react";
import { updateTaskText } from "@/app/actions/admin-tasks";
import { RichTextEditor } from "@/components/admin/RichTextEditor";

export function UpdateTaskForm({
  taskId,
  title,
  textBody,
}: {
  taskId: string;
  title: string;
  textBody: string;
}) {
  const updateTaskWithId = updateTaskText.bind(null, taskId);
  const [state, formAction, isPending] = useActionState(
    updateTaskWithId,
    undefined
  );
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (state?.success) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: show a toast that auto-dismisses via timer
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [state]);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input
        name="title"
        defaultValue={title}
        required
        className="rounded-md border border-gray-300 px-3 py-2 text-sm"
      />
      <RichTextEditor name="textBody" defaultValue={textBody} placeholder="本文" />

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {showSuccess && (
        <p className="text-sm text-green-600">更新できました</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="self-start rounded-md bg-brown-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brown-600 disabled:opacity-50"
      >
        {isPending ? "更新中..." : "更新"}
      </button>
    </form>
  );
}
