import { Avatar } from "antd";
import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  padding: 16px;
  height: 80px;

  @media (min-width: 640px) {
    height: 4rem;
  }
`;

export const LeftContainer = styled.div`
  flex: 1;

  @media (min-width: 640px) {
    button {
      display: none;
    }
  }
`;

export const StyledAvatar = styled(Avatar)`
  background-color: ${({ theme }) => theme.colorBgElevated} !important;
  color: ${({ theme }) => theme.colorText} !important;

  &:hover {
    cursor: pointer;
  }
`;
