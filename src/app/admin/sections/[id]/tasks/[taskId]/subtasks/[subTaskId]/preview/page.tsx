import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ImageGallery } from "@/components/student/ImageGallery";

export default async function AdminSubTaskPreviewPage({
  params,
}: {
  params: Promise<{ id: string; taskId: string; subTaskId: string }>;
}) {
  const { id, taskId, subTaskId } = await params;

  const subTask = await prisma.subTask.findUnique({
    where: { id: subTaskId },
    include: {
      task: { include: { section: true } },
      images: { orderBy: { order: "asc" } },
    },
  });

  if (!subTask || subTask.taskId !== taskId || subTask.task.sectionId !== id) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-brown-50">
      <div className="border-b border-brown-200 bg-brown-100 px-4 py-2 text-center text-xs font-semibold text-brown-700">
        これは受講画面のプレビューです（実際の進捗には反映されません）
      </div>

      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
        <Link
          href={`/admin/sections/${id}/tasks/${taskId}/subtasks/${subTaskId}`}
          className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
        >
          ← 編集画面に戻る
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
            <span className="rounded-md bg-gray-100 px-4 py-2 text-sm text-gray-500">
              （プレビューのため「完了にする」ボタンは無効です）
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
