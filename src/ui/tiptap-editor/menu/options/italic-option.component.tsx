import { FaItalic } from "react-icons/fa6";
import { Option } from "./option.component";
import { useCurrentEditor } from "@tiptap/react";

export function ItalicOption() {
  const { editor } = useCurrentEditor();

  return (
    <Option
      tooltip="Itálico"
      isActive={editor?.isActive("italic") ?? false}
      isDisabled={!editor?.can().chain().focus().toggleItalic().run()}
      onClick={() => editor?.chain().focus().toggleItalic().run()}
    >
      <FaItalic />
    </Option>
  );
}
