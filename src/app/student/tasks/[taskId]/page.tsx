import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { markTaskComplete } from "@/app/actions/student";
import { getCatMessage } from "@/lib/catMessages";
import {
  getTotalPublishedTaskCount,
  getUserCompletedTaskCount,
} from "@/lib/progress";
import { CatMascot } from "@/components/CatMascot";

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
    include: { section: true },
  });

  if (!task || !task.published || !task.section.published) notFound();

  let progress = await prisma.progress.findUnique({
    where: { userId_taskId: { userId, taskId } },
  });

  if (!progress) {
    progress = await prisma.progress.create({
      data: { userId, taskId, status: "IN_PROGRESS" },
    });
  }

  const isCompleted = progress.status === "COMPLETED";

  let catMessage = getCatMessage("task_start");
  if (isCompleted) {
    const [totalTasks, completedTasks, sectionTasks, sectionCompleted] =
      await Promise.all([
        getTotalPublishedTaskCount(),
        getUserCompletedTaskCount(userId),
        prisma.task.count({
          where: { sectionId: task.sectionId, published: true },
        }),
        prisma.progress.count({
          where: {
            userId,
            status: "COMPLETED",
            task: { sectionId: task.sectionId, published: true },
          },
        }),
      ]);

    if (completedTasks >= totalTasks) {
      catMessage = getCatMessage("all_complete");
    } else if (sectionCompleted >= sectionTasks) {
      catMessage = getCatMessage("section_complete");
    } else {
      catMessage = getCatMessage("task_complete");
    }
  }

  const markCompleteWithTaskId = markTaskComplete.bind(null, task.id);

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`/student/sections/${task.sectionId}`}
        className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
      >
        ← {task.section.title}に戻る
      </Link>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <p className="text-xs text-gray-400">{task.section.title}</p>
        <h1 className="mt-1 text-lg font-bold text-gray-800">{task.title}</h1>

        {task.textBody && (
          <p className="mt-4 whitespace-pre-wrap text-sm text-gray-700">
            {task.textBody}
          </p>
        )}

        {task.videoUrl && (
          <video src={task.videoUrl} controls className="mt-4 w-full rounded-md" />
        )}

        {task.fileUrl && (
          <a
            href={task.fileUrl}
            className="mt-4 inline-block rounded-md bg-brown-100 px-4 py-2 text-sm text-brown-700 hover:bg-brown-200"
          >
            📄 {task.fileName ?? "ファイルをダウンロード"}
          </a>
        )}

        {task.imageUrls.length > 0 && (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {task.imageUrls.map((url) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={url}
                src={url}
                alt=""
                className="w-full rounded-md border border-gray-100"
              />
            ))}
          </div>
        )}

        <div className="mt-6">
          {isCompleted ? (
            <span className="rounded-md bg-green-50 px-4 py-2 text-sm text-green-700">
              ✅ この課題は完了しています
            </span>
          ) : (
            <form action={markCompleteWithTaskId}>
              <button
                type="submit"
                className="rounded-md bg-brown-500 px-5 py-2 text-sm font-semibold text-white hover:bg-brown-600"
              >
                完了にする
              </button>
            </form>
          )}
        </div>
      </div>

      <CatMascot message={catMessage} />
    </div>
  );
}
