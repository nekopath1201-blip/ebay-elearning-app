import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect(session.user.role === "ADMIN" ? "/admin" : "/student");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-brown-50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-md">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-gray-800">
            ebay チビ太クラス
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            管理者から発行されたアカウントでログインしてください
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
