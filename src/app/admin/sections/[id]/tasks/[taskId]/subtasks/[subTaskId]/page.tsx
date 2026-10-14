import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  removeTaskVideo,
  removeTaskFile,
  removeTaskImage,
  updateImageTitle,
} from "@/app/actions/admin-tasks";
import { FileUploader } from "@/components/admin/FileUploader";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { UpdateSubTaskForm } from "@/components/admin/UpdateSubTaskForm";

export default async function AdminSubTaskDetailPage({
  params,
}: {
  params: Promise<{ id: string; taskId: string; subTaskId: string }>;
}) {
  const { id, taskId, subTaskId } = await params;

  const subTask = await prisma.subTask.findUnique({
    where: { id: subTaskId },
    include: { images: { orderBy: { order: "asc" } } },
  });

  if (!subTask || subTask.taskId !== taskId) notFound();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <Link
          href={`/admin/sections/${id}/tasks/${taskId}`}
          className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
        >
          ← 課題に戻る
        </Link>
        <Link
          href={`/admin/sections/${id}/tasks/${taskId}/subtasks/${subTaskId}/preview`}
          target="_blank"
          className="rounded-md border border-brown-600 px-3 py-1 text-sm text-brown-600 hover:bg-brown-50"
        >
          受講画面プレビュー →
        </Link>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-gray-700">タスク情報</h2>
        <UpdateSubTaskForm
          subTaskId={subTask.id}
          title={subTask.title}
          textBody={subTask.textBody ?? ""}
        />
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-gray-700">動画</h2>
        {subTask.videoUrl && (
          <div className="mb-4">
            <video src={subTask.videoUrl} controls className="w-full max-w-md rounded-md" />
            <form action={removeTaskVideo.bind(null, subTask.id)} className="mt-1">
              <ConfirmSubmitButton
                confirmMessage="この動画を削除しますか？"
                className="text-xs text-red-600 hover:text-red-700 hover:underline"
              >
                削除
              </ConfirmSubmitButton>
            </form>
          </div>
        )}
        <FileUploader taskId={subTask.id} kind="video" accept="video/*" />
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-gray-700">ファイル</h2>
        {subTask.fileUrl && (
          <div className="mb-4 flex items-center gap-3 text-sm">
            <span>
              現在のファイル:{" "}
              <a href={subTask.fileUrl} className="text-brown-600 hover:text-brown-700 hover:underline">
                {subTask.fileName}
              </a>
            </span>
            <form action={removeTaskFile.bind(null, subTask.id)}>
              <ConfirmSubmitButton
                confirmMessage="このファイルを削除しますか？"
                className="text-xs text-red-600 hover:text-red-700 hover:underline"
              >
                削除
              </ConfirmSubmitButton>
            </form>
          </div>
        )}
        <FileUploader taskId={subTask.id} kind="file" accept="*/*" />
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-gray-700">画像</h2>
        {subTask.images.length > 0 && (
          <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {subTask.images.map((image) => (
              <div key={image.id} className="flex flex-col gap-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt=""
                  className="h-32 w-full rounded-md object-cover"
                />
                {image.title && (
                  <p className="text-xs text-gray-700">{image.title}</p>
                )}
                <form action={updateImageTitle.bind(null, image.id)} className="flex gap-1">
                  <input
                    name="title"
                    placeholder="画像タイトル"
                    className="w-full rounded-md border border-gray-300 px-2 py-1 text-xs"
                  />
                  <button
                    type="submit"
                    className="shrink-0 rounded-md bg-brown-500 px-2 py-1 text-xs font-semibold text-white hover:bg-brown-600"
                  >
                    保存
                  </button>
                </form>
                <form action={removeTaskImage.bind(null, image.id)}>
                  <ConfirmSubmitButton
                    confirmMessage="この画像を削除しますか？"
                    className="text-xs text-red-600 hover:text-red-700 hover:underline"
                  >
                    削除
                  </ConfirmSubmitButton>
                </form>
              </div>
            ))}
          </div>
        )}
        <FileUploader taskId={subTask.id} kind="image" accept="image/*" />
      </div>
    </div>
  );
}
