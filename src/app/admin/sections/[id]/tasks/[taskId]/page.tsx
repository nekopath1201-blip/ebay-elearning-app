import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateTaskText } from "@/app/actions/admin-tasks";
import {
  addQuizQuestion,
  deleteQuizQuestion,
  removeTaskImage,
} from "@/app/actions/admin-tasks";
import { FileUploader } from "@/components/admin/FileUploader";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";

export default async function AdminTaskDetailPage({
  params,
}: {
  params: Promise<{ id: string; taskId: string }>;
}) {
  const { id, taskId } = await params;

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { questions: { orderBy: { order: "asc" } } },
  });

  if (!task || task.sectionId !== id) notFound();

  const updateTaskWithId = updateTaskText.bind(null, task.id);
  const addQuizQuestionWithId = addQuizQuestion.bind(null, task.id);

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
          {(task.type === "TEXT" || task.type === "VIDEO") && (
            <textarea
              name="textBody"
              defaultValue={task.textBody ?? ""}
              rows={6}
              placeholder="本文（動画の説明文などにも使えます）"
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          )}
          <button
            type="submit"
            className="self-start rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
          >
            更新
          </button>
        </form>
      </div>

      {task.type === "VIDEO" && (
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-gray-700">動画</h2>
          {task.videoUrl && (
            <video src={task.videoUrl} controls className="mb-4 w-full max-w-md rounded-md" />
          )}
          <FileUploader taskId={task.id} kind="video" accept="video/*" />
        </div>
      )}

      {task.type === "FILE" && (
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-gray-700">ファイル</h2>
          {task.fileUrl && (
            <p className="mb-4 text-sm">
              現在のファイル:{" "}
              <a href={task.fileUrl} className="text-orange-600 hover:text-orange-700 hover:underline">
                {task.fileName}
              </a>
            </p>
          )}
          <FileUploader taskId={task.id} kind="file" accept="*/*" />
        </div>
      )}

      {task.type !== "QUIZ" && (
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-gray-700">画像</h2>
          {task.imageUrls.length > 0 && (
            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {task.imageUrls.map((url) => (
                <div key={url} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt=""
                    className="h-32 w-full rounded-md object-cover"
                  />
                  <form action={removeTaskImage.bind(null, task.id, url)}>
                    <ConfirmSubmitButton
                      confirmMessage="この画像を削除しますか？"
                      className="mt-1 text-xs text-red-600 hover:text-red-700 hover:underline"
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
      )}

      {task.type === "QUIZ" && (
        <div className="flex flex-col gap-4">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-gray-700">
              設問を追加
            </h2>
            <form action={addQuizQuestionWithId} className="flex flex-col gap-3">
              <input
                name="question"
                placeholder="問題文"
                required
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
              {[1, 2, 3, 4].map((n) => (
                <input
                  key={n}
                  name={`choice${n}`}
                  placeholder={`選択肢${n}${n > 2 ? "（任意）" : ""}`}
                  required={n <= 2}
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              ))}
              <label className="flex flex-col gap-1 text-sm text-gray-700">
                正解の選択肢番号（0始まり: 選択肢1なら0）
                <select
                  name="correctAnswerIndex"
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="0">選択肢1</option>
                  <option value="1">選択肢2</option>
                  <option value="2">選択肢3</option>
                  <option value="3">選択肢4</option>
                </select>
              </label>
              <button
                type="submit"
                className="self-start rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
              >
                追加
              </button>
            </form>
          </div>

          <div className="flex flex-col gap-3">
            {task.questions.map((q, i) => (
              <div key={q.id} className="rounded-xl bg-white p-4 shadow-sm">
                <p className="font-semibold text-gray-800">
                  Q{i + 1}. {q.question}
                </p>
                <ul className="mt-2 list-disc pl-5 text-sm text-gray-600">
                  {(q.choices as string[]).map((c, ci) => (
                    <li
                      key={ci}
                      className={
                        ci === q.correctAnswerIndex ? "font-semibold text-green-700" : ""
                      }
                    >
                      {c}
                      {ci === q.correctAnswerIndex && "（正解）"}
                    </li>
                  ))}
                </ul>
                <form action={deleteQuizQuestion.bind(null, q.id)} className="mt-2">
                  <ConfirmSubmitButton
                    confirmMessage="この設問を削除しますか？"
                    className="text-xs text-red-600 hover:text-red-700 hover:underline"
                  >
                    削除
                  </ConfirmSubmitButton>
                </form>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
