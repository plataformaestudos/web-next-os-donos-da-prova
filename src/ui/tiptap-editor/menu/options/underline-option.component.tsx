import { FaUnderline } from "react-icons/fa6";
import { Option } from "./option.component";
import { useCurrentEditor } from "@tiptap/react";

export function UnderlineOption() {
  const { editor } = useCurrentEditor();

  return (
    <Option
      tooltip="Sublinhar"
      isActive={editor?.isActive("underline") ?? false}
      isDisabled={!editor?.can().chain().focus().toggleUnderline().run()}
      onClick={() => editor?.chain().focus().toggleUnderline().run()}
    >
      <FaUnderline />
    </Option>
  );
}
