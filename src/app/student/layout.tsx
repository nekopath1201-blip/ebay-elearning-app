import Link from "next/link";
import { auth } from "@/auth";
import { logoutAction } from "@/app/actions/auth";
import { getTotalPublishedTaskCount, getUserCompletedTaskCount } from "@/lib/progress";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const [total, completed] = await Promise.all([
    getTotalPublishedTaskCount(),
    session?.user ? getUserCompletedTaskCount(session.user.id) : Promise.resolve(0),
  ]);
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-orange-50">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-3xl px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <Link href="/student" className="font-bold whitespace-nowrap text-gray-800 hover:text-orange-600">
              🐱 ネコパスのイーラーニング
            </Link>
            <form action={logoutAction}>
              <button type="submit" className="text-sm whitespace-nowrap text-gray-500 hover:text-gray-800">
                ログアウト
              </button>
            </form>
          </div>
          <nav className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <Link href="/student" className="whitespace-nowrap text-gray-600 hover:text-orange-600">
              ホーム
            </Link>
            <Link href="/student/password" className="whitespace-nowrap text-gray-600 hover:text-orange-600">
              パスワード変更
            </Link>
          </nav>
        </div>
        <div className="mx-auto max-w-3xl px-4 pb-3">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{session?.user?.name} さんの進捗</span>
            <span>
              {completed} / {total} 課題完了（{percent}%）
            </span>
          </div>
          <div className="mt-1 h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-orange-500 transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
    </div>
  );
}
