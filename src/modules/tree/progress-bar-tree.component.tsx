import styled from "styled-components";

interface ProgressBarProps {
  value: number;
}

export const InlineProgressBarContainer = styled.div`
  flex-shrink: 0;
  width: 80px; // largura da barra
  height: 8px; // altura da barra
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-left: 8px; // espaço entre título e barra
`;

export const InlineProgressBarFiller = styled.div<ProgressBarProps>`
  height: 100%;
  width: ${({ value }) => value}%;
  background-color: ${({ value }) =>
    value > 75 ? "#4caf50" : value > 50 ? "#8bc34a" : value > 25 ? "#cddc39" : "#ff9800"};
  transition: width 0.3s ease-in-out, background-color 0.3s ease-in-out;
`;
