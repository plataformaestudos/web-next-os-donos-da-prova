import { FaListOl } from "react-icons/fa6";
import { Option } from "./option.component";
import { useCurrentEditor } from "@tiptap/react";

export function OrderedListOption() {
  const { editor } = useCurrentEditor();

  return (
    <Option
      tooltip="Lista ordenada"
      isActive={editor?.isActive("orderedList") ?? false}
      isDisabled={!editor?.can().chain().focus().toggleOrderedList().run()}
      onClick={() => editor?.chain().focus().toggleOrderedList().run()}
    >
      <FaListOl />
    </Option>
  );
}
