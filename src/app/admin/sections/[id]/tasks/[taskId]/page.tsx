import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  updateTaskText,
  removeTaskVideo,
  removeTaskFile,
  removeTaskImage,
  updateImageTitle,
} from "@/app/actions/admin-tasks";
import { FileUploader } from "@/components/admin/FileUploader";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { RichTextEditor } from "@/components/admin/RichTextEditor";

export default async function AdminTaskDetailPage({
  params,
}: {
  params: Promise<{ id: string; taskId: string }>;
}) {
  const { id, taskId } = await params;

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { images: { orderBy: { order: "asc" } } },
  });

  if (!task || task.sectionId !== id) notFound();

  const updateTaskWithId = updateTaskText.bind(null, task.id);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link
          href={`/admin/sections/${id}`}
          className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
        >
          ← セクションに戻る
        </Link>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-gray-700">課題情報</h2>
        <form action={updateTaskWithId} className="flex flex-col gap-3">
          <input
            name="title"
            defaultValue={task.title}
            required
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <RichTextEditor
            name="textBody"
            defaultValue={task.textBody ?? ""}
            placeholder="本文"
          />
          <button
            type="submit"
            className="self-start rounded-md bg-brown-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brown-600"
          >
            更新
          </button>
        </form>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-gray-700">動画</h2>
        {task.videoUrl && (
          <div className="mb-4">
            <video src={task.videoUrl} controls className="w-full max-w-md rounded-md" />
            <form action={removeTaskVideo.bind(null, task.id)} className="mt-1">
              <ConfirmSubmitButton
                confirmMessage="この動画を削除しますか？"
                className="text-xs text-red-600 hover:text-red-700 hover:underline"
              >
                削除
              </ConfirmSubmitButton>
            </form>
          </div>
        )}
        <FileUploader taskId={task.id} kind="video" accept="video/*" />
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-gray-700">ファイル</h2>
        {task.fileUrl && (
          <div className="mb-4 flex items-center gap-3 text-sm">
            <span>
              現在のファイル:{" "}
              <a href={task.fileUrl} className="text-brown-600 hover:text-brown-700 hover:underline">
                {task.fileName}
              </a>
            </span>
            <form action={removeTaskFile.bind(null, task.id)}>
              <ConfirmSubmitButton
                confirmMessage="このファイルを削除しますか？"
                className="text-xs text-red-600 hover:text-red-700 hover:underline"
              >
                削除
              </ConfirmSubmitButton>
            </form>
          </div>
        )}
        <FileUploader taskId={task.id} kind="file" accept="*/*" />
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-gray-700">画像</h2>
        {task.images.length > 0 && (
          <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {task.images.map((image) => (
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
        <FileUploader taskId={task.id} kind="image" accept="image/*" />
      </div>
    </div>
  );
}
