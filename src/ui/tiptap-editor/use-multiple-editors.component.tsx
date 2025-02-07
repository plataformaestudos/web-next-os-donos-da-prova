import { Editor, EditorContext } from "@tiptap/react";
import { useEffect, useState } from "react";

import { TiptapEditorMenu } from "./menu/tiptap-editor-menu.component";

export function useMultipleEditors() {
  const [, setKey] = useState(Math.random());
  const [focusedEditor, setFocusedEditor] = useState<Editor | null>(null);

  // Updates the component everytime the focused editor changes
  useEffect(() => {
    if (focusedEditor) {
      function onChange() {
        setKey(Math.random());
      }

      focusedEditor?.on("transaction", onChange);

      return () => {
        focusedEditor?.off("transaction", onChange);
      };
    }
  }, [focusedEditor]);

  return {
    menu: (
      <EditorContext value={{ editor: focusedEditor }}>
        <TiptapEditorMenu />
      </EditorContext>
    ),
    onFocus: setFocusedEditor,
  };
}
