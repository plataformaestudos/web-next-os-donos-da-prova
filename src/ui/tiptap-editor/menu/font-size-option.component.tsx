import * as Styled from "./font-size-option.style";

import { FaFont, FaSortDown, FaSortUp } from "react-icons/fa6";

import { Dropdown } from "antd";
import { Option } from "./option.component";
import { useCurrentEditor } from "@tiptap/react";

export function FontSizeOption() {
  const { editor } = useCurrentEditor();

  return (
    <Dropdown
      disabled={!editor?.can().chain().focus().setFontSize("16px").run()}
      menu={{
        onClick: ({ key: fontSize }) => {
          editor?.chain().focus().setFontSize(fontSize).run();
        },
        items: [
          {
            key: "12px",
            label: <Styled.Small>Pequeno</Styled.Small>,
          },
          { key: "16px", label: <Styled.Normal>Normal</Styled.Normal> },
          {
            key: "20px",
            label: <Styled.Large>Grande</Styled.Large>,
          },
          {
            key: "24px",
            label: <Styled.Huge>Gigante</Styled.Huge>,
          },
        ],
      }}
      trigger={["click"]}
    >
      <span>
        <Option
          tooltip="Tamanho do texto"
          isActive={false}
          isDisabled={!editor?.can().chain().focus().setFontSize("16px").run()}
        >
          <FaFont />
          <Styled.CustomIcon>
            <FaSortUp size={8} className="sort-up" />
            <FaSortDown size={8} />
          </Styled.CustomIcon>
        </Option>
      </span>
    </Dropdown>
  );
}
