import Link from "next/link";
import { auth } from "@/auth";
import { ChangeEmailForm } from "@/components/account/ChangeEmailForm";

export default async function AdminEmailPage() {
  const session = await auth();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/settings" className="text-sm text-gray-500 hover:text-gray-700 hover:underline">
          ← 設定に戻る
        </Link>
      </div>

      <div>
        <h1 className="text-xl font-bold text-gray-800">メールアドレス変更</h1>
        <p className="mt-1 text-sm text-gray-500">
          管理者アカウントのメールアドレス（ログインID）を変更します。
        </p>
      </div>
      <div className="max-w-sm rounded-xl bg-white p-6 shadow-sm">
        <ChangeEmailForm currentEmail={session?.user?.email ?? ""} />
      </div>
    </div>
  );
}
