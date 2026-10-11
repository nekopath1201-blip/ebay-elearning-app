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
        include: {
          subTasks: { where: { published: true } },
        },
      },
    },
  });

  const progressList = await prisma.progress.findMany({
    where: { userId, status: "COMPLETED" },
  });
  const completedSubTaskIds = new Set(progressList.map((p) => p.subTaskId));

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
        const tasksWithProgress = section.tasks.map((task) => {
          const completedCount = task.subTasks.filter((s) =>
            completedSubTaskIds.has(s.id)
          ).length;
          return {
            id: task.id,
            title: task.title,
            completedCount,
            totalCount: task.subTasks.length,
          };
        });
        const completedCount = tasksWithProgress.reduce(
          (sum, t) => sum + t.completedCount,
          0
        );
        const totalCount = tasksWithProgress.reduce(
          (sum, t) => sum + t.totalCount,
          0
        );

        return (
          <SectionAccordion
            key={section.id}
            section={{
              id: section.id,
              title: section.title,
              description: section.description,
              tasks: tasksWithProgress,
              completedCount,
              totalCount,
            }}
          />
        );
      })}

      <CatMascot message={getCatMessage("welcome")} />
    </div>
  );
}
