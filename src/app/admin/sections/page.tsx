import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createSection, moveSection } from "@/app/actions/admin-sections";

export default async function AdminSectionsPage() {
  const sections = await prisma.section.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { tasks: true } } },
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-bold text-gray-800">セクション管理</h1>
        <p className="mt-1 text-sm text-gray-500">
          大きな単位である「セクション」を作成し、その中に課題を追加していきます。
        </p>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-gray-700">
          新しいセクションを作成
        </h2>
        <form action={createSection} className="flex flex-col gap-3">
          <input
            name="title"
            placeholder="セクションタイトル"
            required
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <textarea
            name="description"
            placeholder="説明（任意）"
            rows={2}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="self-start rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
          >
            作成
          </button>
        </form>
      </div>

      <div className="flex flex-col gap-3">
        {sections.length === 0 && (
          <p className="text-sm text-gray-500">まだセクションがありません。</p>
        )}
        {sections.map((section, index) => (
          <div
            key={section.id}
            className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <form action={moveSection.bind(null, section.id, "up")}>
                  <button
                    type="submit"
                    disabled={index === 0}
                    aria-label="上に移動"
                    className="text-gray-400 hover:text-orange-600 disabled:opacity-20"
                  >
                    ▲
                  </button>
                </form>
                <form action={moveSection.bind(null, section.id, "down")}>
                  <button
                    type="submit"
                    disabled={index === sections.length - 1}
                    aria-label="下に移動"
                    className="text-gray-400 hover:text-orange-600 disabled:opacity-20"
                  >
                    ▼
                  </button>
                </form>
              </div>
              <div>
                <p className="font-semibold text-gray-800">{section.title}</p>
                <p className="text-xs text-gray-500">
                  課題数: {section._count.tasks}件
                  {!section.published && "（非公開）"}
                </p>
              </div>
            </div>
            <Link
              href={`/admin/sections/${section.id}`}
              className="text-sm text-orange-600 hover:text-orange-700 hover:underline"
            >
              編集 →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
