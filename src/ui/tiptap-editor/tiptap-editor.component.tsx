import "./styles.css";
import "katex/dist/katex.min.css";

import { useEffect, useState } from "react";

import { Editor } from "@tiptap/core";
import FileHandler from "@tiptap-pro/extension-file-handler";
import { FontSize } from "./extensions/font-size.tiptap-extension";
import { Fragment } from "@tiptap/pm/model";
import ImageResize from "tiptap-extension-resize-image";
import ListKeymap from "@tiptap/extension-list-keymap";
import { Mathematics } from "@tiptap-pro/extension-mathematics";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import { StyledEditorContent } from "./tiptap-editor.stye";
import TextStyle from "@tiptap/extension-text-style";
import { Transaction } from "@tiptap/pm/state";
import Underline from "@tiptap/extension-underline";
import HttpClient from "@/util/http-client/fetch-client.util";
import { ResponseModel } from "@/model/common.model";
import { message } from "antd";
import { useEditor } from "@tiptap/react";

export async function uploadFile(file: File) {
  const body = new FormData();
  body.append("file", file);
  try {
    const response = await HttpClient.fetch<ResponseModel<{ url: string }>>("/question-images", { method: "POST", body }, false);
    return response.data.url;
  } catch {
    message.error("Não foi possível enviar a imagem. Use PNG, JPEG, GIF ou WebP de até 2 MiB.");
    return undefined;
  }
}

async function handleImageDeletes(transaction: Transaction) {
  const getImageSrcs = (fragment: Fragment) => {
    const srcs = new Set<string>();
    fragment.forEach((node) => {
      if (node.type.name === "image") {
        srcs.add(node.attrs.src);
      }
    });
    return srcs;
  };

  const currentSrcs = getImageSrcs(transaction.doc.content);
  const previousSrcs = getImageSrcs(transaction.before.content);

  if (currentSrcs.size === 0 && previousSrcs.size === 0) {
    return;
  }

  const deletedImageSrcs = [...previousSrcs].filter(
    (src) => !currentSrcs.has(src)
  );

  if (deletedImageSrcs.length > 0) {
    await Promise.all(deletedImageSrcs.filter(src => src.includes("/editor/")).map(url =>
      HttpClient.fetch("/question-images", { method: "DELETE", body: JSON.stringify({ url }) }, false)
    ));
  }
}

export function TiptapEditor({
  editable = true,
  defaultValue,
  placeholder,
  onFocus,
  onChange,
  fontSize,
}: {
  editable?: boolean;
  defaultValue?: string;
  placeholder?: string;
  onFocus?: (editor: Editor | null) => void;
  onChange?: (value: string) => void;
  fontSize?: string;
}) {
  const [isFocused, setIsFocused] = useState(false);

  const editor = useEditor({
    content: defaultValue,
    editable,
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: "list-disc pl-8",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal pl-8",
          },
        },
      }),
      TextStyle,
      Underline,
      ListKeymap,
      Placeholder.configure({
        placeholder,
      }),
      FontSize,
      // DOCX imports place images inside paragraphs, alongside text and marks.
      ImageResize.configure({ inline: true }),
      FileHandler.configure({
        allowedMimeTypes: [
          "image/png",
          "image/jpeg",
          "image/gif",
          "image/webp",
        ],
        onDrop: (currentEditor, files, pos) => {
          files.forEach((file) => {
            uploadFile(file).then((path) => {
              if (path) {
                currentEditor
                  .chain()
                  .insertContentAt(pos, {
                    type: "image",
                    attrs: {
                      src: path,
                    },
                  })
                  .focus()
                  .run();
              }
            });
          });
        },
        onPaste: (currentEditor, files) => {
          files.forEach((file) => {
            uploadFile(file).then((path) => {
              if (path) {
                currentEditor
                  .chain()
                  .insertContentAt(currentEditor.state.selection.anchor, {
                    type: "image",
                    attrs: {
                      src: path,
                    },
                  })
                  .focus()
                  .run();
              }
            });
          });
        },
      }),
      Mathematics.configure({
        shouldRender: (state, pos, node) => {
          if (!node.text) return false;
          const regex = /(?<![R\\])\$(.*?)(?<![R\\])\$/g;
          const matches = node.text?.match(regex);
          return matches && matches.length > 0 ? true : false;
        },
      }),
    ],
    immediatelyRender: false,
    onFocus: () => {
      onFocus?.(editor);
      setIsFocused(true);
    },
    onBlur: () => {
      setIsFocused(false);
    },
    onUpdate: ({ editor }) =>
      onChange?.(editor.isEmpty ? "" : editor.getHTML()),
    onTransaction({ transaction }) {
      if (editable && transaction.docChanged) {
        void handleImageDeletes(transaction).catch(() => console.error("Não foi possível remover a imagem temporária."));
      }
    },
  });

  useEffect(() => {
    if (!editor) return;

    if (defaultValue === "") {
      editor.commands.clearContent();
    }
  }, [editor, defaultValue]);

  return (
    <StyledEditorContent
      editor={editor}
      $focused={isFocused}
      $disabled={!editable}
      $fontSize={fontSize}
    />
  );
}
