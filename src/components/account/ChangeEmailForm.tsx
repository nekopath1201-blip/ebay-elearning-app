"use client";

import { useActionState } from "react";
import { changeEmail } from "@/app/actions/account";
import { PasswordInput } from "@/components/PasswordInput";

export function ChangeEmailForm({ currentEmail }: { currentEmail: string }) {
  const [state, formAction, isPending] = useActionState(
    changeEmail,
    undefined
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <p className="text-sm text-gray-500">
        現在のメールアドレス: <span className="font-medium text-gray-700">{currentEmail}</span>
      </p>
      <div className="flex flex-col gap-1">
        <label htmlFor="newEmail" className="text-sm font-medium">
          新しいメールアドレス
        </label>
        <input
          id="newEmail"
          name="newEmail"
          type="email"
          required
          autoComplete="email"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="currentPassword" className="text-sm font-medium">
          現在のパスワード（確認用）
        </label>
        <PasswordInput
          id="currentPassword"
          name="currentPassword"
          required
          autoComplete="current-password"
        />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && (
        <p className="text-sm text-green-600">
          メールアドレスを変更しました。次回ログインから新しいメールアドレスを使ってください。
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="self-start rounded-md bg-brown-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brown-600 disabled:opacity-50"
      >
        {isPending ? "変更中..." : "メールアドレスを変更"}
      </button>
    </form>
  );
}
