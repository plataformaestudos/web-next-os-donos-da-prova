import type { CSSProperties } from "react";

// Read only dimensions from the canonical HTML; never pass arbitrary DOCX styles.
export function importImageSize(style: string | null): CSSProperties {
  const result: CSSProperties = {};
  for (const match of (style || "").matchAll(/(?:^|;)\s*(width|height)\s*:\s*(\d+(?:\.\d+)?(?:px|in|cm|mm|pt|%))\s*(?=;|$)/gi)) {
    if (match[1].toLowerCase() === "width") result.width = match[2];
    else result.height = match[2];
  }
  return result;
}
