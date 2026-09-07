"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

function generatePassword() {
  return Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4);
}

export async function createStudent(
  _prevState: { error?: string; password?: string } | undefined,
  formData: FormData
) {
  await requireAdmin();

  const email = String(formData.get("email") || "").trim().toLowerCase();
  const name = String(formData.get("name") || "").trim();
  if (!email || !name) {
    return { error: "メールアドレスと名前は必須です" };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "このメールアドレスは既に登録されています" };
  }

  const password = generatePassword();
  await prisma.user.create({
    data: {
      email,
      name,
      role: "STUDENT",
      passwordHash: await bcrypt.hash(password, 10),
    },
  });

  revalidatePath("/admin/students");
  return { password };
}

export async function deleteStudent(userId: string) {
  await requireAdmin();
  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/admin/students");
}
