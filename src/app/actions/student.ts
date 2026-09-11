"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireStudent() {
  const session = await auth();
  if (!session?.user) throw new Error("ログインが必要です");
  return session.user;
}

export async function markTaskComplete(taskId: string) {
  const user = await requireStudent();

  await prisma.progress.upsert({
    where: { userId_taskId: { userId: user.id, taskId } },
    create: {
      userId: user.id,
      taskId,
      status: "COMPLETED",
      completedAt: new Date(),
    },
    update: { status: "COMPLETED", completedAt: new Date() },
  });

  revalidatePath("/student", "layout");
}
