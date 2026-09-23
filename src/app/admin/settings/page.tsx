import Link from "next/link";

const SETTINGS_LINKS = [
  { href: "/admin/students", label: "受講者管理" },
  { href: "/admin/email", label: "メールアドレス変更" },
  { href: "/admin/password", label: "パスワード変更" },
];

export default function AdminSettingsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-bold text-gray-800">設定</h1>
      </div>

      <div className="flex flex-col gap-3">
        {SETTINGS_LINKS.map((item) => (
          <div
            key={item.href}
            className="relative flex items-center justify-between rounded-xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <Link
              href={item.href}
              className="absolute inset-0 z-0"
              aria-label={item.label}
            />
            <p className="pointer-events-none relative z-10 font-semibold text-gray-800">
              {item.label}
            </p>
            <span className="pointer-events-none relative z-10 rounded-md border border-brown-600 px-3 py-1 text-sm text-brown-600">
              開く
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
