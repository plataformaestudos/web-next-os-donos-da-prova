import { FaFont, FaSortDown, FaSortUp } from "react-icons/fa6";

import { Dropdown } from "antd";
import { Option } from "./option.component";
import { useCurrentEditor } from "@tiptap/react";

export function FontSizeOption() {
  const { editor } = useCurrentEditor();

  return (
    <Dropdown
      disabled={!editor?.can().chain().focus().setFontSize("1rem").run()}
      menu={{
        onClick: ({ key: fontSize }) => {
          editor?.chain().focus().setFontSize(fontSize).run();
        },
        items: [
          {
            key: "0.75rem",
            label: <span className="text-xs">Pequeno</span>,
          },
          { key: "1rem", label: <span>Normal</span> },
          {
            key: "1.25rem",
            label: <span className="text-xl">Grande</span>,
          },
          {
            key: "1.5rem",
            label: <span className="text-2xl">Gigante</span>,
          },
        ],
      }}
      trigger={["click"]}
    >
      <span>
        <Option
          tooltip="Tamanho do texto"
          isActive={false}
          isDisabled={!editor?.can().chain().focus().setFontSize("1rem").run()}
        >
          <FaFont />
          <div className="flex flex-col items-center -ml-1.5 -mt-0.5">
            <FaSortUp size={8} className="-mb-1" />
            <FaSortDown size={8} />
          </div>
        </Option>
      </span>
    </Dropdown>
  );
}
