import styled, { css } from "styled-components";

import { EditorContent } from "@tiptap/react";

export const StyledEditorContent = styled(EditorContent)<{
  $focused: boolean;
  $disabled: boolean;
}>`
  padding: 4px;
  transition: border-color 300ms ease-in-out;
  border-radius: 6px;
  flex: 1;

  border: 1px solid;

  border-color: ${({ $focused, theme }) =>
    $focused ? theme.colorPrimaryBorderHover : theme.colorBorder};

  ${({ $disabled }) =>
    $disabled &&
    css`
      border: none;
      padding: 0;
    `}
`;
