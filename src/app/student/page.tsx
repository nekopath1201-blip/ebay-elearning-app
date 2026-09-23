import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getCatMessage } from "@/lib/catMessages";
import { CatMascot } from "@/components/CatMascot";

export default async function StudentHomePage() {
  const session = await auth();
  const userId = session!.user.id;

  const sections = await prisma.section.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
    include: {
      tasks: {
        where: { published: true },
        orderBy: { order: "asc" },
      },
    },
  });

  const progressList = await prisma.progress.findMany({
    where: { userId, status: "COMPLETED" },
  });
  const completedTaskIds = new Set(progressList.map((p) => p.taskId));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-gray-800">セクション一覧</h1>
        <p className="mt-1 text-sm text-gray-500">
          セクションを選んで、課題を順にこなしていきましょう。
        </p>
      </div>

      {sections.length === 0 && (
        <p className="text-sm text-gray-500">まだ公開されているセクションがありません。</p>
      )}

      {sections.map((section) => {
        const completedCount = section.tasks.filter((t) =>
          completedTaskIds.has(t.id)
        ).length;
        const isSectionComplete =
          section.tasks.length > 0 && completedCount === section.tasks.length;

        return (
          <Link
            key={section.id}
            href={`/student/sections/${section.id}`}
            className="flex items-center justify-between rounded-xl bg-white p-5 shadow-sm hover:shadow-md"
          >
            <div>
              <h2 className="font-semibold text-gray-800">{section.title}</h2>
              {section.description && (
                <p className="mt-1 text-sm text-gray-500">{section.description}</p>
              )}
              <p className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                {isSectionComplete && (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 font-semibold text-green-700">
                    完了
                  </span>
                )}
                {completedCount} / {section.tasks.length} 課題完了
              </p>
            </div>
            <span className="text-sm text-brown-600">→</span>
          </Link>
        );
      })}

      <CatMascot message={getCatMessage("welcome")} />
    </div>
  );
}
