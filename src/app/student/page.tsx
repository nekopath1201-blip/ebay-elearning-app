import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getCatMessage } from "@/lib/catMessages";
import { CatMascot } from "@/components/CatMascot";
import { SectionAccordion } from "@/components/student/SectionAccordion";

export default async function StudentHomePage() {
  const session = await auth();
  const userId = session!.user.id;

  const sections = await prisma.section.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
    include: {
      tasks: {
        where: { published: true },
        orderBy: { order: "asc" },
      },
    },
  });

  const progressList = await prisma.progress.findMany({
    where: { userId },
  });
  const progressMap = new Map(progressList.map((p) => [p.taskId, p.status]));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-gray-800">セクション一覧</h1>
        <p className="mt-1 text-sm text-gray-500">
          セクションを選んで、課題を順にこなしていきましょう。
        </p>
      </div>

      {sections.length === 0 && (
        <p className="text-sm text-gray-500">まだ公開されているセクションがありません。</p>
      )}

      {sections.map((section) => {
        const tasksWithStatus = section.tasks.map((task) => ({
          id: task.id,
          title: task.title,
          status: progressMap.get(task.id) ?? "NOT_STARTED",
        }));
        const completedCount = tasksWithStatus.filter(
          (t) => t.status === "COMPLETED"
        ).length;

        return (
          <SectionAccordion
            key={section.id}
            section={{
              id: section.id,
              title: section.title,
              description: section.description,
              tasks: tasksWithStatus,
              completedCount,
            }}
          />
        );
      })}

      <CatMascot message={getCatMessage("welcome")} />
    </div>
  );
}
