"use client";

import { useActionState } from "react";
import { createStudent } from "@/app/actions/admin-students";

export function CreateStudentForm() {
  const [state, formAction, isPending] = useActionState(createStudent, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input
        name="name"
        placeholder="お名前"
        required
        className="rounded-md border border-gray-300 px-3 py-2 text-sm"
      />
      <input
        name="email"
        type="email"
        placeholder="メールアドレス"
        required
        className="rounded-md border border-gray-300 px-3 py-2 text-sm"
      />
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.password && (
        <p className="rounded-md bg-green-50 p-3 text-sm text-green-800">
          アカウントを発行しました。初期パスワード:{" "}
          <span className="font-mono font-bold">{state.password}</span>
          <br />
          このパスワードは二度と表示されません。受講者に安全な方法で伝えてください。
        </p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="self-start rounded-md bg-brown-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brown-600 disabled:opacity-50"
      >
        {isPending ? "発行中..." : "アカウントを発行"}
      </button>
    </form>
  );
}
