"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

export async function createTask(sectionId: string, formData: FormData) {
  await requireAdmin();

  const title = String(formData.get("title") || "").trim();
  const textBody = String(formData.get("textBody") || "").trim();
  if (!title) return;

  const maxOrder = await prisma.task.aggregate({
    where: { sectionId },
    _max: { order: true },
  });

  await prisma.task.create({
    data: {
      sectionId,
      title,
      order: (maxOrder._max.order ?? 0) + 1,
      textBody: textBody || null,
    },
  });

  revalidatePath(`/admin/sections/${sectionId}`);
  revalidatePath("/student", "layout");
}

export async function updateTaskText(taskId: string, formData: FormData) {
  await requireAdmin();

  const title = String(formData.get("title") || "").trim();
  const textBody = String(formData.get("textBody") || "").trim();
  if (!title) return;

  const task = await prisma.task.update({
    where: { id: taskId },
    data: { title, textBody: textBody || null },
  });

  revalidatePath(`/admin/sections/${task.sectionId}`);
  revalidatePath(`/admin/sections/${task.sectionId}/tasks/${taskId}`);
  revalidatePath("/student", "layout");
}

export async function attachUploadedFile(
  taskId: string,
  data: { url: string; fileName: string; kind: "video" | "file" | "image" }
) {
  await requireAdmin();

  let task;
  if (data.kind === "image") {
    const current = await prisma.task.findUniqueOrThrow({
      where: { id: taskId },
      select: { imageUrls: true, sectionId: true },
    });
    task = await prisma.task.update({
      where: { id: taskId },
      data: { imageUrls: [...current.imageUrls, data.url] },
    });
  } else {
    task = await prisma.task.update({
      where: { id: taskId },
      data:
        data.kind === "video"
          ? { videoUrl: data.url }
          : { fileUrl: data.url, fileName: data.fileName },
    });
  }

  revalidatePath(`/admin/sections/${task.sectionId}`);
  revalidatePath(`/admin/sections/${task.sectionId}/tasks/${taskId}`);
  revalidatePath("/student", "layout");
}

export async function removeTaskVideo(taskId: string) {
  await requireAdmin();

  const task = await prisma.task.update({
    where: { id: taskId },
    data: { videoUrl: null },
  });

  revalidatePath(`/admin/sections/${task.sectionId}`);
  revalidatePath(`/admin/sections/${task.sectionId}/tasks/${taskId}`);
  revalidatePath("/student", "layout");
}

export async function removeTaskFile(taskId: string) {
  await requireAdmin();

  const task = await prisma.task.update({
    where: { id: taskId },
    data: { fileUrl: null, fileName: null },
  });

  revalidatePath(`/admin/sections/${task.sectionId}`);
  revalidatePath(`/admin/sections/${task.sectionId}/tasks/${taskId}`);
  revalidatePath("/student", "layout");
}

export async function removeTaskImage(taskId: string, url: string) {
  await requireAdmin();

  const current = await prisma.task.findUniqueOrThrow({
    where: { id: taskId },
    select: { imageUrls: true, sectionId: true },
  });

  const task = await prisma.task.update({
    where: { id: taskId },
    data: { imageUrls: current.imageUrls.filter((u) => u !== url) },
  });

  revalidatePath(`/admin/sections/${task.sectionId}`);
  revalidatePath(`/admin/sections/${task.sectionId}/tasks/${taskId}`);
  revalidatePath("/student", "layout");
}

export async function deleteTask(taskId: string) {
  await requireAdmin();
  const task = await prisma.task.delete({ where: { id: taskId } });
  revalidatePath(`/admin/sections/${task.sectionId}`);
  revalidatePath("/student", "layout");
}

export async function moveTask(
  sectionId: string,
  taskId: string,
  direction: "up" | "down"
) {
  await requireAdmin();

  const tasks = await prisma.task.findMany({
    where: { sectionId },
    orderBy: { order: "asc" },
  });
  const index = tasks.findIndex((t) => t.id === taskId);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapIndex < 0 || swapIndex >= tasks.length) return;

  const current = tasks[index];
  const target = tasks[swapIndex];

  await prisma.$transaction([
    prisma.task.update({ where: { id: current.id }, data: { order: target.order } }),
    prisma.task.update({ where: { id: target.id }, data: { order: current.order } }),
  ]);

  revalidatePath(`/admin/sections/${sectionId}`);
  revalidatePath("/student", "layout");
}
