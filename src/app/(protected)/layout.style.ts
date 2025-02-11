import styled from "styled-components";

export const Container = styled.div`
  display: flex;

  width: 100dvw;
  height: 100dvh;

  position: relative;

  background-color: ${({ theme }) => theme.colorPrimaryBg};
  color: ${({ theme }) => theme.colorText};
`;

export const HeaderAndContentContainer = styled.div`
  display: flex;
  flex-direction: column;

  flex: 1;

  overflow: auto;
`;

export const ContentContainer = styled.div`
  display: flex;

  flex: 1;
`;
