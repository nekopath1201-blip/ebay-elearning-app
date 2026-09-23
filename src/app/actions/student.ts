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

type SaveNoteState = { success?: boolean };

export async function saveTaskNote(
  taskId: string,
  _prevState: SaveNoteState | undefined,
  formData: FormData
): Promise<SaveNoteState> {
  const user = await requireStudent();

  const note = String(formData.get("note") || "").trim();

  await prisma.progress.upsert({
    where: { userId_taskId: { userId: user.id, taskId } },
    create: { userId: user.id, taskId, note: note || null },
    update: { note: note || null },
  });

  revalidatePath(`/student/tasks/${taskId}`);

  return { success: true };
}
