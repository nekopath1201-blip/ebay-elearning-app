"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

export async function createSection(formData: FormData) {
  await requireAdmin();

  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  if (!title) return;

  const maxOrder = await prisma.section.aggregate({ _max: { order: true } });

  await prisma.section.create({
    data: {
      title,
      description: description || null,
      order: (maxOrder._max.order ?? 0) + 1,
    },
  });

  revalidatePath("/admin/sections");
  revalidatePath("/student", "layout");
}

export async function updateSection(sectionId: string, formData: FormData) {
  await requireAdmin();

  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const published = formData.get("published") === "on";
  if (!title) return;

  await prisma.section.update({
    where: { id: sectionId },
    data: { title, description: description || null, published },
  });

  revalidatePath("/admin/sections");
  revalidatePath(`/admin/sections/${sectionId}`);
  revalidatePath("/student", "layout");
}

export async function deleteSection(sectionId: string) {
  await requireAdmin();
  await prisma.section.delete({ where: { id: sectionId } });
  revalidatePath("/admin/sections");
  revalidatePath("/student", "layout");
  redirect("/admin/sections");
}

export async function moveSection(sectionId: string, direction: "up" | "down") {
  await requireAdmin();

  const sections = await prisma.section.findMany({ orderBy: { order: "asc" } });
  const index = sections.findIndex((s) => s.id === sectionId);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapIndex < 0 || swapIndex >= sections.length) return;

  const current = sections[index];
  const target = sections[swapIndex];

  await prisma.$transaction([
    prisma.section.update({ where: { id: current.id }, data: { order: target.order } }),
    prisma.section.update({ where: { id: target.id }, data: { order: current.order } }),
  ]);

  revalidatePath("/admin/sections");
  revalidatePath("/student", "layout");
}
