import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createUploadUrl } from "@/lib/s3";

export async function POST(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const { fileName, fileType, taskId } = await request.json();
  if (!fileName || !fileType || !taskId) {
    return NextResponse.json(
      { error: "fileName, fileType, taskId は必須です" },
      { status: 400 }
    );
  }

  const safeName = String(fileName).replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `tasks/${taskId}/${Date.now()}-${safeName}`;

  try {
    const { uploadUrl, publicUrl } = await createUploadUrl(key, fileType);
    return NextResponse.json({ uploadUrl, publicUrl });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "アップロードURLの発行に失敗しました" },
      { status: 500 }
    );
  }
}
