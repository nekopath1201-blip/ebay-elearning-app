import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-5xl px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <Link href="/admin/sections" className="font-bold whitespace-nowrap text-gray-800 hover:text-brown-600">
              eBay研修 イーラーニング
            </Link>
            <form action={logoutAction}>
              <button type="submit" className="text-sm whitespace-nowrap text-gray-500 hover:text-gray-800">
                ログアウト
              </button>
            </form>
          </div>
          <nav className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <Link href="/admin/sections" className="whitespace-nowrap text-gray-600 hover:text-brown-600">
              セクション管理
            </Link>
            <Link href="/admin/students" className="whitespace-nowrap text-gray-600 hover:text-brown-600">
              受講者管理
            </Link>
            <Link href="/admin/password" className="whitespace-nowrap text-gray-600 hover:text-brown-600">
              パスワード変更
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
