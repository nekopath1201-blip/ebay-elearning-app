import { ChangePasswordForm } from "@/components/account/ChangePasswordForm";

export default function StudentPasswordPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-gray-800">パスワード変更</h1>
        <p className="mt-1 text-sm text-gray-500">
          発行された初期パスワードから、ご自身のパスワードに変更できます。
        </p>
      </div>
      <div className="max-w-sm rounded-xl bg-white p-6 shadow-sm">
        <ChangePasswordForm />
      </div>
    </div>
  );
}
