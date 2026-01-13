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
  max-width: 300px;

  padding: 28px 16px 16px;
  margin: 24px;
  border-radius: 10px;

  background-color: ${({ theme }) => theme.colorBgElevated};

  h2 {
    margin: 0;
  }
`;
