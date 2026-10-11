"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

export async function createTask(sectionId: string, formData: FormData) {
  await requireAdmin();

  const title = String(formData.get("title") || "").trim();
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
    },
  });

  revalidatePath(`/admin/sections/${sectionId}`);
  revalidatePath("/student", "layout");
}

type UpdateTaskState = { success?: boolean; error?: string };

export async function updateTaskTitle(
  taskId: string,
  _prevState: UpdateTaskState | undefined,
  formData: FormData
): Promise<UpdateTaskState> {
  await requireAdmin();

  const title = String(formData.get("title") || "").trim();
  if (!title) {
    return { error: "タイトルを入力してください" };
  }

  const task = await prisma.task.update({
    where: { id: taskId },
    data: { title },
  });

  revalidatePath(`/admin/sections/${task.sectionId}`);
  revalidatePath(`/admin/sections/${task.sectionId}/tasks/${taskId}`);
  revalidatePath("/student", "layout");

  return { success: true };
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

export async function createSubTask(taskId: string, formData: FormData) {
  await requireAdmin();

  const title = String(formData.get("title") || "").trim();
  const textBody = String(formData.get("textBody") || "").trim();
  if (!title) return;

  const task = await prisma.task.findUniqueOrThrow({ where: { id: taskId } });

  const maxOrder = await prisma.subTask.aggregate({
    where: { taskId },
    _max: { order: true },
  });

  await prisma.subTask.create({
    data: {
      taskId,
      title,
      order: (maxOrder._max.order ?? 0) + 1,
      textBody: textBody || null,
    },
  });

  revalidatePath(`/admin/sections/${task.sectionId}/tasks/${taskId}`);
  revalidatePath("/student", "layout");
}

type UpdateSubTaskState = { success?: boolean; error?: string };

export async function updateSubTaskText(
  subTaskId: string,
  _prevState: UpdateSubTaskState | undefined,
  formData: FormData
): Promise<UpdateSubTaskState> {
  await requireAdmin();

  const title = String(formData.get("title") || "").trim();
  const textBody = String(formData.get("textBody") || "").trim();
  if (!title) {
    return { error: "タイトルを入力してください" };
  }

  const subTask = await prisma.subTask.update({
    where: { id: subTaskId },
    data: { title, textBody: textBody || null },
    include: { task: true },
  });

  revalidatePath(`/admin/sections/${subTask.task.sectionId}/tasks/${subTask.taskId}`);
  revalidatePath(
    `/admin/sections/${subTask.task.sectionId}/tasks/${subTask.taskId}/subtasks/${subTaskId}`
  );
  revalidatePath("/student", "layout");

  return { success: true };
}

export async function deleteSubTask(subTaskId: string) {
  await requireAdmin();
  const subTask = await prisma.subTask.delete({
    where: { id: subTaskId },
    include: { task: true },
  });
  revalidatePath(`/admin/sections/${subTask.task.sectionId}/tasks/${subTask.taskId}`);
  revalidatePath("/student", "layout");
}

export async function moveSubTask(
  taskId: string,
  subTaskId: string,
  direction: "up" | "down"
) {
  await requireAdmin();

  const task = await prisma.task.findUniqueOrThrow({ where: { id: taskId } });

  const subTasks = await prisma.subTask.findMany({
    where: { taskId },
    orderBy: { order: "asc" },
  });
  const index = subTasks.findIndex((t) => t.id === subTaskId);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapIndex < 0 || swapIndex >= subTasks.length) return;

  const current = subTasks[index];
  const target = subTasks[swapIndex];

  await prisma.$transaction([
    prisma.subTask.update({ where: { id: current.id }, data: { order: target.order } }),
    prisma.subTask.update({ where: { id: target.id }, data: { order: current.order } }),
  ]);

  revalidatePath(`/admin/sections/${task.sectionId}/tasks/${taskId}`);
  revalidatePath("/student", "layout");
}

export async function attachUploadedFile(
  subTaskId: string,
  data: { url: string; fileName: string; kind: "video" | "file" | "image" }
) {
  await requireAdmin();

  let subTask;
  if (data.kind === "image") {
    const maxOrder = await prisma.taskImage.aggregate({
      where: { subTaskId },
      _max: { order: true },
    });
    await prisma.taskImage.create({
      data: {
        subTaskId,
        url: data.url,
        order: (maxOrder._max.order ?? -1) + 1,
      },
    });
    subTask = await prisma.subTask.findUniqueOrThrow({
      where: { id: subTaskId },
      include: { task: true },
    });
  } else {
    subTask = await prisma.subTask.update({
      where: { id: subTaskId },
      data:
        data.kind === "video"
          ? { videoUrl: data.url }
          : { fileUrl: data.url, fileName: data.fileName },
      include: { task: true },
    });
  }

  revalidatePath(`/admin/sections/${subTask.task.sectionId}/tasks/${subTask.taskId}`);
  revalidatePath(
    `/admin/sections/${subTask.task.sectionId}/tasks/${subTask.taskId}/subtasks/${subTaskId}`
  );
  revalidatePath("/student", "layout");
}

export async function removeTaskVideo(subTaskId: string) {
  await requireAdmin();

  const subTask = await prisma.subTask.update({
    where: { id: subTaskId },
    data: { videoUrl: null },
    include: { task: true },
  });

  revalidatePath(`/admin/sections/${subTask.task.sectionId}/tasks/${subTask.taskId}`);
  revalidatePath(
    `/admin/sections/${subTask.task.sectionId}/tasks/${subTask.taskId}/subtasks/${subTaskId}`
  );
  revalidatePath("/student", "layout");
}

export async function removeTaskFile(subTaskId: string) {
  await requireAdmin();

  const subTask = await prisma.subTask.update({
    where: { id: subTaskId },
    data: { fileUrl: null, fileName: null },
    include: { task: true },
  });

  revalidatePath(`/admin/sections/${subTask.task.sectionId}/tasks/${subTask.taskId}`);
  revalidatePath(
    `/admin/sections/${subTask.task.sectionId}/tasks/${subTask.taskId}/subtasks/${subTaskId}`
  );
  revalidatePath("/student", "layout");
}

export async function removeTaskImage(imageId: string) {
  await requireAdmin();

  const image = await prisma.taskImage.delete({
    where: { id: imageId },
    include: { subTask: { include: { task: true } } },
  });

  revalidatePath(`/admin/sections/${image.subTask.task.sectionId}/tasks/${image.subTask.taskId}`);
  revalidatePath(
    `/admin/sections/${image.subTask.task.sectionId}/tasks/${image.subTask.taskId}/subtasks/${image.subTaskId}`
  );
  revalidatePath("/student", "layout");
}

export async function updateImageTitle(imageId: string, formData: FormData) {
  await requireAdmin();

  const title = String(formData.get("title") || "").trim();

  const image = await prisma.taskImage.update({
    where: { id: imageId },
    data: { title: title || null },
    include: { subTask: { include: { task: true } } },
  });

  revalidatePath(`/admin/sections/${image.subTask.task.sectionId}/tasks/${image.subTask.taskId}`);
  revalidatePath(
    `/admin/sections/${image.subTask.task.sectionId}/tasks/${image.subTask.taskId}/subtasks/${image.subTaskId}`
  );
  revalidatePath("/student", "layout");
}
