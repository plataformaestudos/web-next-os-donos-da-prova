import styled from "styled-components";

interface InfoProps {
  $tertiary?: boolean;
}

export const Title = styled.h1``;

export const Container = styled.div`
  display: flex;
`;

export const Card = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-color: ${({ theme }) => theme.colorSecondary};
  border-radius: 8px;
  height: 100%;
  max-height: 200px;
  padding: 18px;
  gap: 8px;
  transition: filter 0.15s ease-in-out;

  &:hover {
    filter: brightness(0.95);
    cursor: pointer;
  }
`;

export const CardTitle = styled.h2`
  color: ${({ theme }) => theme.colorPrimaryText};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const Info = styled.span<InfoProps>`
  color: ${({ theme, $tertiary }) =>
    $tertiary ? theme.colorTertiary : theme.colorTextPrimary};
  font-size: 14px;
  font-weight: 600;
`;

export const Content = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 40px;
`;

export const SubContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const Button = styled.button`
  background-color: ${({ theme }) => theme.colorTertiary};
  color: ${({ theme }) => theme.colorTertiaryText};
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 700;
  width: fit-content;
  transition: filter 0.15s ease-in-out;

  &:hover {
    filter: brightness(0.95);
    cursor: pointer;
  }
`;

export const Flex = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const Spacer = styled.div``;

export const LoaderContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
`;

export const Loader = styled.div`
  border: 6px solid ${({ theme }) => theme.colorSecondary};
  border-top: 6px solid ${({ theme }) => theme.colorTertiary};
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;
