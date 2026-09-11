import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  updateSection,
  deleteSection,
} from "@/app/actions/admin-sections";
import { createTask, deleteTask, moveTask } from "@/app/actions/admin-tasks";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";

export default async function AdminSectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const section = await prisma.section.findUnique({
    where: { id },
    include: { tasks: { orderBy: { order: "asc" } } },
  });

  if (!section) notFound();

  const updateSectionWithId = updateSection.bind(null, section.id);
  const deleteSectionWithId = deleteSection.bind(null, section.id);
  const createTaskWithId = createTask.bind(null, section.id);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link href="/admin/sections" className="text-sm text-gray-500 hover:text-gray-700 hover:underline">
          ← セクション一覧
        </Link>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-gray-700">セクション情報</h2>
        <form action={updateSectionWithId} className="flex flex-col gap-3">
          <input
            name="title"
            defaultValue={section.title}
            required
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <textarea
            name="description"
            defaultValue={section.description ?? ""}
            rows={2}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              name="published"
              defaultChecked={section.published}
            />
            受講者に公開する
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              className="self-start rounded-md bg-brown-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brown-600"
            >
              更新
            </button>
          </div>
        </form>
        <form action={deleteSectionWithId} className="mt-3">
          <ConfirmSubmitButton
            confirmMessage="このセクションと配下の課題をすべて削除します。よろしいですか？"
            className="text-sm text-red-600 hover:text-red-700 hover:underline"
          >
            セクションを削除
          </ConfirmSubmitButton>
        </form>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-gray-700">課題を追加</h2>
        <form action={createTaskWithId} className="flex flex-col gap-3">
          <input
            name="title"
            placeholder="課題タイトル"
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
            課題を追加
          </button>
        </form>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-gray-700">課題一覧</h2>
        {section.tasks.length === 0 && (
          <p className="text-sm text-gray-500">まだ課題がありません。</p>
        )}
        {section.tasks.map((task, index) => (
          <div
            key={task.id}
            className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <form action={moveTask.bind(null, section.id, task.id, "up")}>
                  <button
                    type="submit"
                    disabled={index === 0}
                    aria-label="上に移動"
                    className="text-gray-400 hover:text-brown-600 disabled:opacity-20"
                  >
                    ▲
                  </button>
                </form>
                <form action={moveTask.bind(null, section.id, task.id, "down")}>
                  <button
                    type="submit"
                    disabled={index === section.tasks.length - 1}
                    aria-label="下に移動"
                    className="text-gray-400 hover:text-brown-600 disabled:opacity-20"
                  >
                    ▼
                  </button>
                </form>
              </div>
              <div>
                <p className="font-semibold text-gray-800">{task.title}</p>
                {!task.published && (
                  <p className="text-xs text-gray-500">（非公開）</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/admin/sections/${section.id}/tasks/${task.id}`}
                className="text-sm text-brown-600 hover:text-brown-700 hover:underline"
              >
                編集
              </Link>
              <form action={deleteTask.bind(null, task.id)}>
                <ConfirmSubmitButton
                  confirmMessage="この課題を削除します。よろしいですか？"
                  className="text-sm text-red-600 hover:text-red-700 hover:underline"
                >
                  削除
                </ConfirmSubmitButton>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
