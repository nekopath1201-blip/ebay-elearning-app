import { prisma } from "@/lib/prisma";

export async function getTotalPublishedTaskCount() {
  return prisma.subTask.count({
    where: {
      published: true,
      task: { published: true, section: { published: true } },
    },
  });
}

export async function getUserCompletedTaskCount(userId: string) {
  return prisma.progress.count({
    where: {
      userId,
      status: "COMPLETED",
      subTask: {
        published: true,
        task: { published: true, section: { published: true } },
      },
    },
  });
}
