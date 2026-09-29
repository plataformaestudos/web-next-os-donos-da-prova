"use client";

/* eslint-disable @next/next/no-img-element -- Keep signed image URLs out of the editor document. */

import { createContext, useContext, useEffect } from "react";
import { Extension, Mark, Node, mergeAttributes } from "@tiptap/core";
import {
  EditorContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  useEditor,
  type NodeViewProps,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import { Mathematics } from "@tiptap-pro/extension-mathematics";
import { Button, Flex, Typography } from "antd";
import "./import-preview.css";
import "katex/dist/katex.min.css";

const ImageUrls = createContext<Record<string, string>>({});
function ImportImage({ node }: NodeViewProps) {
  const urls = useContext(ImageUrls);
  const url = urls[node.attrs.src];
  return (
    <NodeViewWrapper as="span" contentEditable={false}>
      {url && /^https?:\/\//.test(url) ? (
        <img
          data-drag-handle
          src={url}
          alt={node.attrs.alt || "Imagem da questão"}
          referrerPolicy="no-referrer"
        />
      ) : (
        <span data-drag-handle className="import-image-unavailable">
          [Imagem indisponível — referência preservada]
        </span>
      )}
    </NodeViewWrapper>
  );
}
const CanonicalImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: { default: null },
      height: { default: null },
      style: { default: null },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ImportImage);
  },
}).configure({ inline: true });

// Keep DOCX tables in the schema. Editing their text must not flatten the table.
const Table = Node.create({
  name: "importTable",
  group: "block",
  content: "importRow+",
  isolating: true,
  parseHTML: () => [{ tag: "table" }],
  renderHTML: () => ["table", ["tbody", 0]],
});
const Row = Node.create({
  name: "importRow",
  content: "(importCell | importHeader)+",
  parseHTML: () => [{ tag: "tr" }],
  renderHTML: () => ["tr", 0],
});
function cell(name: string, tag: string) {
  return Node.create({
    name,
    content: "block+",
    isolating: true,
    addAttributes: () => ({ colspan: { default: 1 }, rowspan: { default: 1 } }),
    parseHTML: () => [{ tag }],
    renderHTML: ({ HTMLAttributes }) => [tag, HTMLAttributes, 0],
  });
}
const superscript = Mark.create({
  name: "importSup",
  parseHTML: () => [{ tag: "sup" }],
  renderHTML: () => ["sup", 0],
});
const subscript = Mark.create({
  name: "importSub",
  parseHTML: () => [{ tag: "sub" }],
  renderHTML: () => ["sub", 0],
});
const link = Mark.create({
  name: "importLink",
  inclusive: false,
  addAttributes: () => ({
    href: {
      default: null,
      parseHTML: (el) =>
        /^(https?:\/\/|mailto:)/i.test(el.getAttribute("href") || "")
          ? el.getAttribute("href")
          : null,
    },
  }),
  parseHTML: () => [{ tag: "a[href]" }],
  renderHTML: ({ HTMLAttributes }) => [
    "a",
    mergeAttributes(HTMLAttributes, { rel: "noopener noreferrer" }),
    0,
  ],
});
const alignment = Extension.create({
  name: "importAlignment",
  addGlobalAttributes: () => [
    {
      types: ["paragraph", "textStyle"],
      attributes: {
        textAlign: {
          default: null,
          parseHTML: (el) =>
            /^(left|right|center|justify)$/.test(el.style.textAlign)
              ? el.style.textAlign
              : null,
          renderHTML: (attrs) =>
            attrs.textAlign ? { style: `text-align: ${attrs.textAlign}` } : {},
        },
      },
    },
  ],
});

export function ImportRichEditor({
  html,
  imageUrls,
  onChange,
  disabled,
  label,
}: {
  html: string;
  imageUrls: Record<string, string>;
  onChange: (html: string) => void;
  disabled?: boolean;
  label: string;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    content: html,
    editable: !disabled,
    extensions: [
      StarterKit.configure({ heading: false }),
      Underline,
      TextStyle,
      alignment,
      CanonicalImage,
      Table,
      Row,
      cell("importCell", "td"),
      cell("importHeader", "th"),
      superscript,
      subscript,
      link,
      Mathematics.configure({
        shouldRender: (_state, _pos, node) =>
          Boolean(node.text?.match(/(?<![R\\])\$(.*?)(?<![R\\])\$/g)),
      }),
    ],
    editorProps: {
      attributes: {
        "aria-label": label,
        role: "textbox",
        "aria-multiline": "true",
      },
      handlePaste: (_view, event) => Boolean(event.clipboardData?.files.length),
      handleDrop: (_view, event) => Boolean(event.dataTransfer?.files.length),
      transformPastedHTML: (value) => {
        const doc = new DOMParser().parseFromString(value, "text/html");
        doc.querySelectorAll("img").forEach((img) => {
          if (
            !/^import-image:\/\/[0-9a-f]{64}$/.test(
              img.getAttribute("src") || "",
            )
          )
            img.remove();
        });
        return doc.body.innerHTML;
      },
    },
    onUpdate: ({ editor: current, transaction }) => {
      if (transaction.docChanged) onChange(current.getHTML());
    },
  });
  useEffect(() => {
    // Tiptap emits an update by default here; switching read-only mode is not a review.
    editor?.setEditable(!disabled, false);
  }, [editor, disabled]);
  return (
    <ImageUrls.Provider value={imageUrls}>
      <div className="import-rich-editor">
        <Flex gap={4} wrap style={{ marginBottom: 8 }}>
          <Button
            size="small"
            disabled={!editor || disabled}
            onClick={() => editor?.chain().focus().toggleBold().run()}
          >
            Negrito
          </Button>
          <Button
            size="small"
            disabled={!editor || disabled}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
          >
            Itálico
          </Button>
          <Button
            size="small"
            disabled={!editor || disabled}
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
          >
            Sublinhar
          </Button>
          <Button
            size="small"
            disabled={!editor || disabled}
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
          >
            Lista
          </Button>
          <Button
            size="small"
            disabled={!editor || disabled}
            onClick={() => editor?.chain().focus().insertContent("$ $").run()}
          >
            Fórmula
          </Button>
          <Button
            size="small"
            disabled={!editor || disabled}
            onClick={() => editor?.chain().focus().undo().run()}
          >
            Desfazer
          </Button>
        </Flex>
        <EditorContent editor={editor} />
        <Typography.Text type="secondary">
          Imagens existentes podem ser movidas ou removidas. Novas imagens devem
          ser incluídas no DOCX.
        </Typography.Text>
      </div>
    </ImageUrls.Provider>
  );
}
