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
import { ImageGallery } from "@/components/student/ImageGallery";
import { TaskNoteForm } from "@/components/student/TaskNoteForm";

export default async function StudentSubTaskDetailPage({
  params,
}: {
  params: Promise<{ subTaskId: string }>;
}) {
  const { subTaskId } = await params;
  const session = await auth();
  const userId = session!.user.id;

  const subTask = await prisma.subTask.findUnique({
    where: { id: subTaskId },
    include: {
      task: { include: { section: true } },
      images: { orderBy: { order: "asc" } },
    },
  });

  if (
    !subTask ||
    !subTask.published ||
    !subTask.task.published ||
    !subTask.task.section.published
  )
    notFound();

  let progress = await prisma.progress.findUnique({
    where: { userId_subTaskId: { userId, subTaskId } },
  });

  if (!progress) {
    progress = await prisma.progress.create({
      data: { userId, subTaskId, status: "IN_PROGRESS" },
    });
  }

  const isCompleted = progress.status === "COMPLETED";

  let catMessage = getCatMessage("task_start");
  if (isCompleted) {
    const [totalTasks, completedTasks, sectionTasks, sectionCompleted] =
      await Promise.all([
        getTotalPublishedTaskCount(),
        getUserCompletedTaskCount(userId),
        prisma.subTask.count({
          where: { published: true, task: { sectionId: subTask.task.sectionId, published: true } },
        }),
        prisma.progress.count({
          where: {
            userId,
            status: "COMPLETED",
            subTask: {
              published: true,
              task: { sectionId: subTask.task.sectionId, published: true },
            },
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

  const markCompleteWithId = markTaskComplete.bind(null, subTask.id);

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`/student/tasks/${subTask.taskId}`}
        className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
      >
        ← {subTask.task.title}に戻る
      </Link>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <p className="text-xs text-gray-400">
          {subTask.task.section.title} / {subTask.task.title}
        </p>
        <h1 className="mt-1 text-lg font-bold text-gray-800">{subTask.title}</h1>

        {subTask.textBody && (
          <div
            className="mt-4 whitespace-pre-wrap text-sm text-gray-700"
            dangerouslySetInnerHTML={{ __html: subTask.textBody }}
          />
        )}

        {subTask.videoUrl && (
          <video src={subTask.videoUrl} controls className="mt-4 w-full rounded-md" />
        )}

        {subTask.fileUrl && (
          <a
            href={subTask.fileUrl}
            className="mt-4 inline-block rounded-md bg-brown-100 px-4 py-2 text-sm text-brown-700 hover:bg-brown-200"
          >
            📄 {subTask.fileName ?? "ファイルをダウンロード"}
          </a>
        )}

        <ImageGallery
          images={subTask.images.map((image) => ({
            url: image.url,
            title: image.title,
          }))}
        />

        <div className="mt-6">
          {isCompleted ? (
            <span className="rounded-md bg-green-50 px-4 py-2 text-sm text-green-700">
              ✅ このタスクは完了しています
            </span>
          ) : (
            <form action={markCompleteWithId}>
              <button
                type="submit"
                className="rounded-md bg-brown-500 px-5 py-2 text-sm font-semibold text-white hover:bg-brown-600"
              >
                完了にする
              </button>
            </form>
          )}
        </div>

        <TaskNoteForm taskId={subTask.id} note={progress.note ?? ""} />
      </div>

      <CatMascot message={catMessage} />
    </div>
  );
}
