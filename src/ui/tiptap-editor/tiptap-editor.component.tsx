import "./styles.css";

import { EditorContent, useEditor } from "@tiptap/react";

import { Editor } from "@tiptap/core";
import FileHandler from "@tiptap-pro/extension-file-handler";
import { FontSize } from "./extensions/font-size.tiptap-extension";
import { Fragment } from "@tiptap/pm/model";
import ImageResize from "tiptap-extension-resize-image";
import ListKeymap from "@tiptap/extension-list-keymap";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import TextStyle from "@tiptap/extension-text-style";
import { Transaction } from "@tiptap/pm/state";
import Underline from "@tiptap/extension-underline";
import clsx from "clsx";
import { createClient } from "@/util/supabase/client";
import { theme } from "antd";
import { useState } from "react";
import { v4 as uuid } from "uuid";

const { useToken } = theme;

export async function uploadFile(file: File) {
  const client = createClient();
  const { data } = await client.storage
    .from("question-images")
    .upload(uuid(), file);

  return data?.fullPath;
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
    const client = createClient();
    await client.storage
      .from("question-images")
      .remove(
        deletedImageSrcs
          .map((src) => src.split("/").pop() as string)
          .filter(Boolean)
      );
  }
}

export function TiptapEditor({
  editable = true,
  defaultValue,
  placeholder,
  onFocus,
  onChange,
}: {
  editable?: boolean;
  defaultValue?: string;
  placeholder?: string;
  onFocus: (editor: Editor | null) => void;
  onChange: (value: string) => void;
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
      ImageResize,
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
                      src: `https://wrdtodflbsnfpiksmikk.supabase.co/storage/v1/object/public/${path}`,
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
                      src: `https://wrdtodflbsnfpiksmikk.supabase.co/storage/v1/object/public/${path}`,
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
      onFocus(editor);
      setIsFocused(true);
    },
    onBlur: () => {
      setIsFocused(false);
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    onTransaction({ transaction }) {
      handleImageDeletes(transaction);
    },
  });
  const { token } = useToken();

  return (
    <EditorContent
      editor={editor}
      style={{
        backgroundColor: editable ? token.colorBgElevated : undefined,
      }}
      className={clsx("transition-colors", {
        "p-1 border rounded-md flex-1": editable,
        "border-blue-400": isFocused,
      })}
    />
  );
}
