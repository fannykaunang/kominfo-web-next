// components/tinymce-editor.tsx

"use client";

import { useTheme } from "next-themes";
import { Editor } from "@tinymce/tinymce-react";
import { useEffect, useState } from "react";

interface TinyMCEEditorProps {
  value: string;
  onChange: (content: string) => void;
  height?: number;
  apiKey?: string;
}

export function TinyMCEEditor({
  value,
  onChange,
  height = 500,
  apiKey = process.env.NEXT_PUBLIC_TINYMCE_API_KEY,
}: TinyMCEEditorProps) {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .tox .tox-menubar button,
      .tox .tox-mbtn,
      .tox .tox-tbtn,
      .tox .tox-collection__item,
      .tox .tox-collection__item button,
      .tox .tox-collection__item button *,
      .tox .tox-collection__item .tox-collection__item-label,
      .tox .tox-collection__item .tox-collection__item-icon {
        cursor: pointer !important;
        pointer-events: auto !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Show loading skeleton during SSR
  if (!mounted) {
    return (
      <div
        className="border rounded-md animate-pulse bg-muted"
        style={{ height: `${height}px` }}
      />
    );
  }

  // Determine current theme
  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDark = currentTheme === "dark";

  return (
    <Editor
      apiKey={apiKey}
      value={value}
      onEditorChange={onChange}
      init={{
        height,
        menubar: true,
        skin: isDark ? "oxide-dark" : "oxide",
        content_css: isDark ? "dark" : "default",
        plugins: [
          "advlist",
          "autolink",
          "lists",
          "link",
          "image",
          "charmap",
          "preview",
          "anchor",
          "searchreplace",
          "visualblocks",
          "code",
          "fullscreen",
          "insertdatetime",
          "media",
          "table",
          "code",
          "help",
          "wordcount",
        ],
        toolbar:
          "undo redo | blocks | " +
          "bold italic forecolor | alignleft aligncenter " +
          "alignright alignjustify | bullist numlist outdent indent | " +
          "removeformat | image media link | code | help",
        content_style: `
          body { 
            font-family: Helvetica, Arial, sans-serif; 
            font-size: 14px;
            padding: 1rem;
            line-height: 1.6;
            ${
              isDark
                ? `
              background-color: #1a1a1a;
              color: #e5e5e5;
            `
                : `
              background-color: #ffffff;
              color: #000000;
            `
            }
          }
          ${
            isDark
              ? `
            a { 
              color: #60a5fa; 
              text-decoration: underline;
            }
            a:hover { color: #93c5fd; }
            code { 
              background-color: #2a2a2a; 
              color: #e5e5e5; 
              padding: 2px 6px;
              border-radius: 3px;
              font-family: monospace;
            }
            pre {
              background-color: #2a2a2a;
              padding: 1rem;
              border-radius: 6px;
              overflow-x: auto;
            }
            blockquote {
              border-left: 4px solid #4b5563;
              padding-left: 1rem;
              margin: 1rem 0;
              color: #9ca3af;
            }
            table {
              border-collapse: collapse;
              width: 100%;
            }
            table td, table th {
              border: 1px solid #4b5563;
              padding: 8px;
            }
            table th {
              background-color: #2a2a2a;
            }
          `
              : `
            a { 
              color: #2563eb; 
              text-decoration: underline;
            }
            a:hover { color: #1d4ed8; }
            code { 
              background-color: #f3f4f6; 
              color: #1f2937; 
              padding: 2px 6px;
              border-radius: 3px;
              font-family: monospace;
            }
            pre {
              background-color: #f3f4f6;
              padding: 1rem;
              border-radius: 6px;
              overflow-x: auto;
            }
            blockquote {
              border-left: 4px solid #d1d5db;
              padding-left: 1rem;
              margin: 1rem 0;
              color: #6b7280;
            }
            table {
              border-collapse: collapse;
              width: 100%;
            }
            table td, table th {
              border: 1px solid #d1d5db;
              padding: 8px;
            }
            table th {
              background-color: #f9fafb;
            }
          `
          }
        `,
      }}
    />
  );
}
