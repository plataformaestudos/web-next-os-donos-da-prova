import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: ${({ theme }) => theme.colorPrimaryBg};
`;

export const Card = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  width: 100%;
  max-width: 500px;

  padding: 48px 32px;
  margin: 24px;
  border-radius: 10px;

  background-color: ${({ theme }) => theme.colorBgElevated};

  h2 {
    margin: 0;
  }
`;

export const IconContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 8px;
`;

export const MessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 24px 0;
  width: 100%;
`;

export const ButtonContainer = styled.div`
  width: 100%;
  margin-top: 24px;
`;

