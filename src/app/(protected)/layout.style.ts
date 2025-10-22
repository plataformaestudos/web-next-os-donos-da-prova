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
  min-height: 100vh;

  overflow: auto; /* Permite scroll quando necessário */
  
  /* Scrollbar personalizado */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colorPrimaryBg};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colorPrimary};
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colorPrimary};
    opacity: 0.8;
  }
`;

export const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: visible; /* Permite que o conteúdo seja visível sem cortar */
  min-height: 0; /* Permite que o flex funcione corretamente */
`;
