"use client";

import { useRef, useState } from "react";
import { attachUploadedFile } from "@/app/actions/admin-tasks";

export function FileUploader({
  taskId,
  kind,
  accept,
}: {
  taskId: string;
  kind: "video" | "file" | "image";
  accept: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<
    { state: "idle" } | { state: "uploading" } | { state: "error"; message: string } | { state: "done" }
  >({ state: "idle" });

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus({ state: "uploading" });
    try {
      const presignRes = await fetch("/api/upload/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type || "application/octet-stream",
          taskId,
        }),
      });
      const presignData = await presignRes.json();
      if (!presignRes.ok) {
        throw new Error(presignData.error || "アップロードURLの取得に失敗しました");
      }

      const putRes = await fetch(presignData.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });
      if (!putRes.ok) {
        throw new Error("ファイルのアップロードに失敗しました");
      }

      await attachUploadedFile(taskId, {
        url: presignData.publicUrl,
        fileName: file.name,
        kind,
      });

      setStatus({ state: "done" });
    } catch (error) {
      setStatus({
        state: "error",
        message: error instanceof Error ? error.message : "アップロードに失敗しました",
      });
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        disabled={status.state === "uploading"}
        className="text-sm"
      />
      {status.state === "uploading" && (
        <p className="text-xs text-gray-500">アップロード中...</p>
      )}
      {status.state === "error" && (
        <p className="text-xs text-red-600">{status.message}</p>
      )}
      {status.state === "done" && (
        <p className="text-xs text-green-600">アップロード完了しました</p>
      )}
    </div>
  );
}
