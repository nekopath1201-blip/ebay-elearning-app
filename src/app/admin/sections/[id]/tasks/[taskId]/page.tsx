import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSubTask, deleteSubTask, moveSubTask } from "@/app/actions/admin-tasks";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { UpdateTaskForm } from "@/components/admin/UpdateTaskForm";

export default async function AdminTaskDetailPage({
  params,
}: {
  params: Promise<{ id: string; taskId: string }>;
}) {
  const { id, taskId } = await params;

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { subTasks: { orderBy: { order: "asc" } } },
  });

  if (!task || task.sectionId !== id) notFound();

  const createSubTaskWithId = createSubTask.bind(null, task.id);

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
        <UpdateTaskForm taskId={task.id} title={task.title} />
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-gray-700">タスク一覧</h2>
        {task.subTasks.length === 0 && (
          <p className="text-sm text-gray-500">まだタスクがありません。</p>
        )}
        {task.subTasks.map((subTask, index) => (
          <div
            key={subTask.id}
            className="relative flex items-center justify-between rounded-xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <Link
              href={`/admin/sections/${id}/tasks/${taskId}/subtasks/${subTask.id}`}
              className="absolute inset-0 z-0"
              aria-label={`${subTask.title}を編集`}
            />
            <div className="pointer-events-none relative z-10 flex items-center gap-3">
              <div className="pointer-events-auto flex flex-col">
                <form action={moveSubTask.bind(null, task.id, subTask.id, "up")}>
                  <button
                    type="submit"
                    disabled={index === 0}
                    aria-label="上に移動"
                    className="text-gray-400 hover:text-brown-600 disabled:opacity-20"
                  >
                    ▲
                  </button>
                </form>
                <form action={moveSubTask.bind(null, task.id, subTask.id, "down")}>
                  <button
                    type="submit"
                    disabled={index === task.subTasks.length - 1}
                    aria-label="下に移動"
                    className="text-gray-400 hover:text-brown-600 disabled:opacity-20"
                  >
                    ▼
                  </button>
                </form>
              </div>
              <div>
                <p className="font-semibold text-gray-800">{subTask.title}</p>
                {!subTask.published && (
                  <p className="text-xs text-gray-500">（非公開）</p>
                )}
              </div>
            </div>
            <div className="pointer-events-none relative z-10 flex items-center gap-3">
              <span className="pointer-events-none rounded-md border border-brown-600 px-3 py-1 text-sm text-brown-600">
                編集
              </span>
              <form action={deleteSubTask.bind(null, subTask.id)} className="pointer-events-auto">
                <ConfirmSubmitButton
                  confirmMessage="このタスクを削除します。よろしいですか？"
                  className="text-sm text-red-600 hover:text-red-700 hover:underline"
                >
                  削除
                </ConfirmSubmitButton>
              </form>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-gray-700">タスクを追加</h2>
        <form action={createSubTaskWithId} className="flex flex-col gap-3">
          <input
            name="title"
            placeholder="タスクタイトル"
            required
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <textarea
            name="textBody"
            placeholder="テキスト内容（あとから編集画面でも変更できます）"
            rows={2}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <p className="text-xs text-gray-500">
            動画・画像・ファイルの添付は、作成後の編集画面から行えます。
          </p>
          <button
            type="submit"
            className="self-start rounded-md bg-brown-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brown-600"
          >
            タスクを追加
          </button>
        </form>
      </div>
    </div>
  );
}
