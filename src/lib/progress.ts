import { prisma } from "@/lib/prisma";

export async function getTotalPublishedTaskCount() {
  return prisma.task.count({
    where: { published: true, section: { published: true } },
  });
}

export async function getUserCompletedTaskCount(userId: string) {
  return prisma.progress.count({
    where: {
      userId,
      status: "COMPLETED",
      task: { published: true, section: { published: true } },
    },
  });
}
