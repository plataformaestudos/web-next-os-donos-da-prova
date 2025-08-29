import styled from "styled-components";

interface InfoProps {
  $tertiary?: boolean;
}

export const Title = styled.h1``;

export const Container = styled.div`
  display: flex;
`;

export const CardPerformance = styled.div<{ $large?: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-color: ${({ theme }) => theme.colorSecondary};
  border-radius: 8px;
  height: 100%;
  min-height: ${({ $large }) => ($large ? "260px" : "auto")};
  padding: 18px;
  gap: 8px;
  transition: filter 0.15s ease-in-out;

  &:hover {
    filter: brightness(0.95);
    cursor: pointer;
  }
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
export const Performance = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

export const PerformanceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #333;
`;

export const DaysGrid = styled.div`
  display: grid;
  /* 7 colunas fixas para manter alinhamento */
  grid-template-columns: repeat(7, 34px);
  gap: 8px;
  margin-top: 8px;
  width: 100%;
  justify-content: start;
  justify-items: center;
  align-items: center;

  /* evita empilhamento/overflow vertical dentro do card */
  box-sizing: border-box;
  grid-auto-rows: minmax(34px, min-content);
  align-content: start;

  /* permitir scroll horizontal em telas muito pequenas */
  overflow-x: auto;
  padding-bottom: 4px;
`;

export const DayDot = styled.div<{ $active?: boolean }>`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;            
  font-size: 12px;
  cursor: default;
  user-select: none;
  flex: 0 0 auto;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: ${({ $active, theme }) =>
    $active ? theme.colorTertiary : "#f2f2f2"};
   color: ${({ $active, theme }) =>
    $active ? theme.colorTertiaryText : theme.colorTextPrimary};
  box-sizing: border-box;
  z-index: 0;
`;



