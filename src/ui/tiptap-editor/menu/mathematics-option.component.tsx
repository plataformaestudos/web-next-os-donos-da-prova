import { Option } from "./option.component";
import { RiFormula } from "react-icons/ri";
import { useCurrentEditor } from "@tiptap/react";

export function MathematicsOption() {
  const { editor } = useCurrentEditor();

  return (
    <Option
      tooltip="Fórmulas LaTeX"
      isActive={new RegExp(/\$([^\$]*)\$/gi).test(
        editor?.state.selection.$anchor.parent.textContent ?? ""
      )}
      isDisabled={!editor?.can().chain().focus().run()}
      onClick={() =>
        editor
          ?.chain()
          .insertContentAt(editor.state.selection.anchor, {
            type: "text",
            text: "$ $",
          })
          .focus(editor.state.selection.anchor + 1)
          .run()
      }
    >
      <RiFormula />
    </Option>
  );
}
