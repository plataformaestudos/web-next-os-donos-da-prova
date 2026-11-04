"use client";

import { useEffect, useState } from "react";
import { TiptapEditor } from "@/ui/tiptap-editor/tiptap-editor.component";
import { prepareImportContent } from "./prepare-import-content";
import "./import-preview.css";

export function ImportContent({ html, imageUrls }: { html: string; imageUrls: Record<string, string> }) {
  const [content, setContent] = useState<string | null>(null);
  useEffect(() => {
    setContent(prepareImportContent(html, imageUrls));
  }, [html, imageUrls]);
  return <div className="import-content">{content === null ? <span>—</span> : <TiptapEditor editable={false} defaultValue={content} />}</div>;
}
