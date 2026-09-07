"use client";

import { useActionState } from "react";
import { changePassword } from "@/app/actions/account";
import { PasswordInput } from "@/components/PasswordInput";

export function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState(
    changePassword,
    undefined
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor="currentPassword" className="text-sm font-medium">
          現在のパスワード
        </label>
        <PasswordInput
          id="currentPassword"
          name="currentPassword"
          required
          autoComplete="current-password"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="newPassword" className="text-sm font-medium">
          新しいパスワード（8文字以上）
        </label>
        <PasswordInput
          id="newPassword"
          name="newPassword"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="newPasswordConfirm" className="text-sm font-medium">
          新しいパスワード（確認用）
        </label>
        <PasswordInput
          id="newPasswordConfirm"
          name="newPasswordConfirm"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && (
        <p className="text-sm text-green-600">
          パスワードを変更しました。次回ログインから新しいパスワードを使ってください。
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="self-start rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
      >
        {isPending ? "変更中..." : "パスワードを変更"}
      </button>
    </form>
  );
}
