import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: ${({ theme }) => theme.colorFillContent};
`;

export const Card = styled.div`
  display: flex;
  width: 100%;
  max-width: 896px;
  height: 500px;

  border-radius: 6px;
`;

export const LogoContainer = styled.div`
  width: 50%;
  height: 100%;

  img {
    border-radius: 6px 0 0 6px;
    object-fit: cover;
    width: 100%;
    height: 100%;
  }
`;

export const FormContainer = styled.div`
  width: 50%;
  height: 100%;
  padding: 32px;
  background-color: ${({ theme }) => theme.colorBgElevated};
  border-radius: 0 6px 6px 0;
  text-align: center;
`;
