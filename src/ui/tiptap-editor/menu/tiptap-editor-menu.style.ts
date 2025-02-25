import styled from "styled-components";

export const MenuContainer = styled.div`
  display: flex;
  align-items: center;

  position: sticky;
  top: 0;

  height: 42px;
  gap: 4px;
  background: ${({ theme }) => theme.colorBgElevated};
  padding: 6px 16px;
  margin: -8px -16px -16px;
  z-index: 1;
  transition: box-shadow 300ms ease-in-out, border-radius 300ms ease-in-out;

  &.stuck {
    border-radius: 0 0 8px 8px;
    box-shadow: ${({ theme }) => theme.boxShadow};
  }
`;
