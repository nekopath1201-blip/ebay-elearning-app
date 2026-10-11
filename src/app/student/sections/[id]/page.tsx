import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function StudentSectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const userId = session!.user.id;

  const section = await prisma.section.findUnique({
    where: { id },
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

  if (!section || !section.published) notFound();

  const allSubTaskIds = section.tasks.flatMap((t) => t.subTasks.map((s) => s.id));
  const progressList = await prisma.progress.findMany({
    where: { userId, subTaskId: { in: allSubTaskIds }, status: "COMPLETED" },
  });
  const completedSubTaskIds = new Set(progressList.map((p) => p.subTaskId));

  return (
    <div className="flex flex-col gap-6">
      <Link href="/student" className="text-sm text-gray-500 hover:text-gray-700 hover:underline">
        ← セクション一覧に戻る
      </Link>

      <div>
        <h1 className="text-xl font-bold text-gray-800">{section.title}</h1>
        {section.description && (
          <p className="mt-1 text-sm text-gray-500">{section.description}</p>
        )}
      </div>

      <div className="rounded-xl bg-white p-5 shadow-sm">
        <ul className="flex flex-col gap-2">
          {section.tasks.map((task) => {
            const completedCount = task.subTasks.filter((s) =>
              completedSubTaskIds.has(s.id)
            ).length;
            return (
              <li key={task.id}>
                <Link
                  href={`/student/tasks/${task.id}`}
                  className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 text-[15px] hover:bg-brown-50"
                >
                  <span className="text-black">{task.title}</span>
                  <span className="text-[13px] text-black">
                    {completedCount} / {task.subTasks.length} タスク完了
                  </span>
                </Link>
              </li>
            );
          })}
          {section.tasks.length === 0 && (
            <p className="text-xs text-gray-400">課題がまだありません。</p>
          )}
        </ul>
      </div>
    </div>
  );
}
