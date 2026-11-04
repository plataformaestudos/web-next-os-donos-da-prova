import "./styles.css";
import "katex/dist/katex.min.css";

import { useEffect, useState } from "react";

import { Editor } from "@tiptap/core";
import FileHandler from "@tiptap-pro/extension-file-handler";
import { QuestionImage, questionContentExtensions } from "./extensions/question-content.tiptap-extension";
import { Fragment } from "@tiptap/pm/model";
import Placeholder from "@tiptap/extension-placeholder";
import { StyledEditorContent } from "./tiptap-editor.stye";
import { Transaction } from "@tiptap/pm/state";
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
      ...questionContentExtensions(),
      Placeholder.configure({
        placeholder,
      }),
      QuestionImage,
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

    if (!editable) {
      // Preview requests can renew signed image URLs without remounting the card.
      editor.commands.setContent(defaultValue || "", false);
      return;
    }

    if (defaultValue === "") {
      editor.commands.clearContent();
    }
  }, [editor, defaultValue, editable]);

  return (
    <StyledEditorContent
      editor={editor}
      $focused={isFocused}
      $disabled={!editable}
      $fontSize={fontSize}
    />
  );
}
