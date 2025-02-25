import { FaListUl } from "react-icons/fa6";
import { Option } from "./option.component";
import { useCurrentEditor } from "@tiptap/react";

export function BulletListOption() {
  const { editor } = useCurrentEditor();

  return (
    <Option
      tooltip="Lista"
      isActive={editor?.isActive("bulletList") ?? false}
      isDisabled={!editor?.can().chain().focus().toggleBulletList().run()}
      onClick={() => editor?.chain().focus().toggleBulletList().run()}
    >
      <FaListUl />
    </Option>
  );
}
