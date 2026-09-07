"use server";

import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type ChangePasswordState = { error?: string; success?: boolean };

export async function changePassword(
  _prevState: ChangePasswordState | undefined,
  formData: FormData
): Promise<ChangePasswordState> {
  const session = await auth();
  if (!session?.user) {
    return { error: "ログインが必要です" };
  }

  const currentPassword = String(formData.get("currentPassword") || "");
  const newPassword = String(formData.get("newPassword") || "");
  const newPasswordConfirm = String(formData.get("newPasswordConfirm") || "");

  if (newPassword.length < 8) {
    return { error: "新しいパスワードは8文字以上にしてください" };
  }
  if (newPassword !== newPasswordConfirm) {
    return { error: "新しいパスワード（確認用）が一致しません" };
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
  });

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    return { error: "現在のパスワードが正しくありません" };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(newPassword, 10) },
  });

  return { success: true };
}
