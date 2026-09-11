"use server";

import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type ChangeEmailState = { error?: string; success?: boolean };

export async function changeEmail(
  _prevState: ChangeEmailState | undefined,
  formData: FormData
): Promise<ChangeEmailState> {
  const session = await auth();
  if (!session?.user) {
    return { error: "ログインが必要です" };
  }

  const currentPassword = String(formData.get("currentPassword") || "");
  const newEmail = String(formData.get("newEmail") || "").trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
    return { error: "メールアドレスの形式が正しくありません" };
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
  });

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    return { error: "現在のパスワードが正しくありません" };
  }

  const existing = await prisma.user.findUnique({ where: { email: newEmail } });
  if (existing && existing.id !== user.id) {
    return { error: "このメールアドレスは既に使用されています" };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { email: newEmail },
  });

  return { success: true };
}

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
