"use client";

import { useEffect, useRef, useState } from "react";

const FONT_SIZES = [
  { label: "小", value: "2" },
  { label: "標準", value: "3" },
  { label: "大", value: "5" },
  { label: "特大", value: "7" },
];

const COLORS = [
  { label: "黒", value: "#111827" },
  { label: "赤", value: "#dc2626" },
  { label: "青", value: "#2563eb" },
  { label: "緑", value: "#16a34a" },
  { label: "オレンジ", value: "#ea580c" },
];

export function RichTextEditor({
  name,
  defaultValue,
  placeholder,
}: {
  name: string;
  defaultValue: string;
  placeholder?: string;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const hiddenRef = useRef<HTMLInputElement>(null);
  const [htmlMode, setHtmlMode] = useState(false);
  const [htmlValue, setHtmlValue] = useState(defaultValue || "");

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = defaultValue || "";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function sync(html?: string) {
    if (hiddenRef.current) {
      hiddenRef.current.value = html ?? editorRef.current?.innerHTML ?? "";
    }
  }

  function exec(command: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand("styleWithCSS", false, "true");
    document.execCommand(command, false, value);
    sync();
  }

  function handlePaste(e: React.ClipboardEvent<HTMLDivElement>) {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
    sync();
  }

  function toggleHtmlMode() {
    if (!htmlMode) {
      setHtmlValue(editorRef.current?.innerHTML ?? "");
      setHtmlMode(true);
    } else {
      if (editorRef.current) {
        editorRef.current.innerHTML = htmlValue;
      }
      sync(htmlValue);
      setHtmlMode(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-2 rounded-t-md border border-b-0 border-gray-300 bg-gray-50 p-2">
        {!htmlMode && (
          <>
            <button
              type="button"
              onClick={() => exec("bold")}
              className="rounded border border-gray-300 bg-white px-2 py-1 text-xs font-bold hover:bg-gray-100"
            >
              B
            </button>
            <select
              onChange={(e) => {
                if (e.target.value) exec("fontSize", e.target.value);
                e.target.value = "";
              }}
              defaultValue=""
              className="rounded border border-gray-300 bg-white px-2 py-1 text-xs"
            >
              <option value="" disabled>
                文字サイズ
              </option>
              {FONT_SIZES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-1">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => exec("foreColor", c.value)}
                  aria-label={c.label}
                  title={c.label}
                  className="h-6 w-6 rounded-full border border-gray-300"
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
          </>
        )}
        <button
          type="button"
          onClick={toggleHtmlMode}
          className="ml-auto rounded border border-gray-300 bg-white px-2 py-1 text-xs hover:bg-gray-100"
        >
          {htmlMode ? "プレビューに戻る" : "HTMLで編集"}
        </button>
      </div>

      <textarea
        value={htmlValue}
        onChange={(e) => {
          setHtmlValue(e.target.value);
          sync(e.target.value);
        }}
        rows={10}
        placeholder="<p>本文</p> のようにHTMLタグを直接入力できます"
        hidden={!htmlMode}
        className="min-h-[150px] rounded-b-md border border-gray-300 px-3 py-2 font-mono text-xs focus:outline-none"
      />
      <div
        ref={editorRef}
        contentEditable
        onInput={() => sync()}
        onPaste={handlePaste}
        onBlur={() => sync()}
        data-placeholder={placeholder}
        hidden={htmlMode}
        className="min-h-[150px] rounded-b-md border border-gray-300 px-3 py-2 text-sm empty:before:text-gray-400 empty:before:content-[attr(data-placeholder)] focus:outline-none"
        suppressContentEditableWarning
      />

      <input
        ref={hiddenRef}
        type="hidden"
        name={name}
        defaultValue={defaultValue}
      />
    </div>
  );
}
