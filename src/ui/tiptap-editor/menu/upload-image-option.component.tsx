import { FaRegFileImage } from "react-icons/fa6";
import { Option } from "./option.component";
import { uploadFile } from "../tiptap-editor.component";
import { useCurrentEditor } from "@tiptap/react";

export function UploadImageOption() {
  const { editor } = useCurrentEditor();

  return (
    <>
      <input
        type="file"
        id="img-upload"
        className="hidden"
        onChange={(ev) => {
          const file = ev.target.files?.[0];
          if (file && editor) {
            uploadFile(file).then((path) => {
              if (path) {
                editor
                  .chain()
                  .insertContentAt(editor.state.selection.anchor, {
                    type: "image",
                    attrs: {
                      src: `https://wrdtodflbsnfpiksmikk.supabase.co/storage/v1/object/public/${path}`,
                    },
                  })
                  .focus()
                  .run();
              }
            });
          }
        }}
      />
      <Option
        isDisabled={!editor?.can()?.chain().focus()}
        isActive={false}
        tooltip="Importar imagem"
        onClick={() => {
          editor?.chain().focus();
          document.getElementById("img-upload")?.click();
        }}
      >
        <FaRegFileImage />
      </Option>
    </>
  );
}
