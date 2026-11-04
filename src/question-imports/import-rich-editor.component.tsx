"use client";

/* eslint-disable @next/next/no-img-element -- Keep signed image URLs out of the editor document. */

import { createContext, useContext, useEffect } from "react";
import { QuestionImage, questionContentExtensions } from "@/ui/tiptap-editor/extensions/question-content.tiptap-extension";
import {
  EditorContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  useEditor,
  type NodeViewProps,
} from "@tiptap/react";
import { Button, Flex, Typography } from "antd";
import "./import-preview.css";
import "@/ui/tiptap-editor/styles.css";
import "katex/dist/katex.min.css";
import { importImageSize } from "./import-image-size";

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
          style={importImageSize(node.attrs.style)}
        />
      ) : (
        <span data-drag-handle className="import-image-unavailable">
          [Imagem indisponível — referência preservada]
        </span>
      )}
    </NodeViewWrapper>
  );
}
const CanonicalImage = QuestionImage.extend({
  addNodeView() {
    return ReactNodeViewRenderer(ImportImage);
  },
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
      ...questionContentExtensions(),
      CanonicalImage,
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
