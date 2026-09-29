"use client";

/* eslint-disable @next/next/no-img-element -- Signed private URLs are refreshed by the preview API. */

import { createElement, useEffect, useState, type ReactNode } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import "./import-preview.css";

const tags = new Set(
  "p br strong b em i u s sup sub blockquote pre code ul ol li hr table thead tbody tfoot tr th td a span".split(
    " ",
  ),
);

function renderText(text: string): ReactNode {
  return text.split(/((?<![R\\])\$[^$\n]+\$)/g).map((part, index) => {
    if (!/^\$[^$]+\$$/.test(part)) return part;
    try {
      return (
        <span
          key={index}
          dangerouslySetInnerHTML={{
            __html: katex.renderToString(part.slice(1, -1), {
              throwOnError: false,
              trust: false,
              maxExpand: 500,
            }),
          }}
        />
      );
    } catch {
      return part;
    }
  });
}

// Create React elements from an explicit allowlist, including for malformed drafts.
// Never inject the DOCX HTML itself or fetch an image not present in the signed map.
export function ImportContent({
  html,
  imageUrls,
}: {
  html: string;
  imageUrls: Record<string, string>;
}) {
  const [content, setContent] = useState<ReactNode>(null);
  useEffect(() => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    function render(node: ChildNode, key: number): ReactNode {
      if (node.nodeType === Node.TEXT_NODE)
        return renderText(node.textContent ?? "");
      if (!(node instanceof Element)) return null;
      const tag = node.tagName.toLowerCase();
      if (["script", "style", "iframe", "object", "svg"].includes(tag))
        return null;
      if (tag === "img") {
        const url = imageUrls[node.getAttribute("src") ?? ""];
        return url && /^https?:\/\//.test(url) ? (
          <img
            key={key}
            src={url}
            alt={node.getAttribute("alt") || "Imagem da questão"}
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span key={key} className="import-image-unavailable">
            [Imagem indisponível]
          </span>
        );
      }
      const children = Array.from(node.childNodes).map(render);
      if (!tags.has(tag)) return <span key={key}>{children}</span>;
      const attrs: Record<string, unknown> = { key };
      if (tag === "a") {
        const href = node.getAttribute("href") ?? "";
        if (/^(https?:\/\/|mailto:)/i.test(href)) attrs.href = href;
        attrs.target = "_blank";
        attrs.rel = "noopener noreferrer";
      }
      if (tag === "td" || tag === "th") {
        attrs.colSpan = Math.min(
          100,
          Math.max(1, Number(node.getAttribute("colspan")) || 1),
        );
        attrs.rowSpan = Math.min(
          100,
          Math.max(1, Number(node.getAttribute("rowspan")) || 1),
        );
      }
      if (tag === "ol") attrs.start = Number(node.getAttribute("start")) || 1;
      if (
        node instanceof HTMLElement &&
        /^(left|right|center|justify)$/.test(node.style.textAlign)
      )
        attrs.style = { textAlign: node.style.textAlign };
      return createElement(
        tag,
        attrs,
        ...(["br", "hr"].includes(tag) ? [] : children),
      );
    }
    setContent(Array.from(doc.body.childNodes).map(render));
  }, [html, imageUrls]);
  return <div className="import-content">{content || <span>—</span>}</div>;
}
