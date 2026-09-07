import { auth } from "@/auth";

export async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("管理者権限が必要です");
  }
  return session;
}
