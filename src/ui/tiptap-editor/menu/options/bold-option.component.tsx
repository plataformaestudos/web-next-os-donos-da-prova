import { FaBold } from "react-icons/fa6";
import { Option } from "./option.component";
import { useCurrentEditor } from "@tiptap/react";

export function BoldOption() {
  const { editor } = useCurrentEditor();

  return (
    <Option
      tooltip="Negrito"
      isActive={editor?.isActive("bold") ?? false}
      isDisabled={!editor?.can().chain().focus().toggleBold().run()}
      onClick={() => editor?.chain().focus().toggleBold().run()}
    >
      <FaBold />
    </Option>
  );
}
