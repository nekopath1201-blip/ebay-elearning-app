import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const STATUS_BADGE: Record<string, string> = {
  NOT_STARTED: "⬜ 未着手",
  IN_PROGRESS: "🟡 進行中",
  COMPLETED: "✅ 完了",
};

export default async function StudentTaskDetailPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;
  const session = await auth();
  const userId = session!.user.id;

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      section: true,
      subTasks: {
        where: { published: true },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!task || !task.published || !task.section.published) notFound();

  const progressList = await prisma.progress.findMany({
    where: { userId, subTaskId: { in: task.subTasks.map((s) => s.id) } },
  });
  const progressMap = new Map(progressList.map((p) => [p.subTaskId, p.status]));

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`/student/sections/${task.sectionId}`}
        className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
      >
        ← {task.section.title}に戻る
      </Link>

      <div>
        <p className="text-xs text-gray-400">{task.section.title}</p>
        <h1 className="mt-1 text-xl font-bold text-gray-800">{task.title}</h1>
      </div>

      <div className="rounded-xl bg-white p-5 shadow-sm">
        <ul className="flex flex-col gap-2">
          {task.subTasks.map((subTask) => (
            <li key={subTask.id}>
              <Link
                href={`/student/subtasks/${subTask.id}`}
                className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 text-[15px] hover:bg-brown-50"
              >
                <span className="text-black">{subTask.title}</span>
                <span className="text-[13px] text-black">
                  {STATUS_BADGE[progressMap.get(subTask.id) ?? "NOT_STARTED"]}
                </span>
              </Link>
            </li>
          ))}
          {task.subTasks.length === 0 && (
            <p className="text-xs text-gray-400">タスクがまだありません。</p>
          )}
        </ul>
      </div>
    </div>
  );
}
