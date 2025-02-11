import { Divider, Flex } from "antd";

import { Fragment } from "react";
import { optionGroups } from "./menu-option-groups.constant";

export function TiptapEditorMenu() {
  return (
    <Flex gap={4} align="center" style={{ height: 24 }}>
      {optionGroups.map((group, index) => (
        <Fragment key={index}>
          {group}
          {index < optionGroups.length - 1 && (
            <Divider type="vertical" style={{ height: "100%" }} />
          )}
        </Fragment>
      ))}
    </Flex>
  );
}
