"use client";

import "quill/dist/quill.snow.css";

import { LoadingOutlined } from "@ant-design/icons";
import { useEffect } from "react";
import { useQuill } from "react-quilljs";

interface QuillEditor {
  defaultValue?: string;
  onChange: (value: string) => void;
}

export function QuillEditor({ defaultValue, onChange }: QuillEditor) {
  const { quill, quillRef } = useQuill({
    modules: {
      toolbar: ["bold", "italic", "underline", "strike"],
    },
    formats: ["bold", "italic", "underline", "strike"],
  });

  useEffect(() => {
    if (defaultValue && quill) {
      quill.clipboard.dangerouslyPasteHTML(defaultValue);
    }
  }, [quill, defaultValue]);

  useEffect(() => {
    function onTextChangeHandler() {
      if (quill) {
        onChange(quill.root.innerHTML);
      }
    }

    if (quill) {
      quill.on("text-change", onTextChangeHandler);

      return () => {
        quill.off("text-change", onTextChangeHandler);
      };
    }
  }, [quill, onChange]);

  return (
    <>
      {!quill && <LoadingOutlined />}
      <div ref={quillRef} />
    </>
  );
}
