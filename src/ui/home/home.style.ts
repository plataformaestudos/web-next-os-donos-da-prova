import styled from "styled-components";

interface InfoProps {
  $tertiary?: boolean;
}

export const Title = styled.h1``;

export const Container = styled.div`
  display: flex;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const CardPerformance = styled.div<{ $large?: boolean; $hasFreePlanUsage?: boolean }>`
  grid-area: performance;
  display: flex;
  position: relative;
  flex-direction: column;
  justify-content: center;
  background-color: ${({ theme }) => theme.colorSecondary};
  border-radius: 8px;
  height: 100%;
  min-height: ${({ $large }) => ($large ? "260px" : "auto")};
  padding: 18px;
  gap: 8px;
  transition: filter 0.15s ease-in-out;
  flex: 0 0 auto;
  min-width: fit-content;

  @media (min-width: 1025px) {
    ${({ $hasFreePlanUsage }) => $hasFreePlanUsage && `
      align-self: start;
      height: fit-content;
    `}
  }

  &:hover {
    filter: brightness(0.95);
    cursor: pointer;
  }
  
  /* iPad e tablets - esconder mascote e usar grid */
  @media (max-width: 1024px) and (min-width: 769px) {
    width: 100%;
    height: clamp(350px, 25vw, 380px);
    min-height: clamp(350px, 25vw, 380px);
    max-height: clamp(350px, 25vw, 380px);
    padding: clamp(16px, 3vw, 20px);
    gap: clamp(8px, 1.5vw, 10px);
    grid-area: performance;
    flex: none;
    min-width: auto;
    
    img {
      display: none;
    }
  }
  
  @media (max-width: 768px) {
    width: 100%;
    height: clamp(250px, 35vw, 400px);
    min-height: clamp(300px, 35vw, 400px);
    max-height: clamp(250px, 35vw, 400px);
    padding: clamp(16px, 4vw, 24px);
    gap: clamp(8px, 2vw, 12px);
    grid-area: performance;
    flex: none;
    min-width: auto;
    
    /* Esconder a imagem da mascote no mobile */
    img {
      display: none;
    }
  }
`;

export const Card = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-color: ${({ theme }) => theme.colorSecondary};
  border-radius: clamp(6px, 2vw, 12px);
  height: 100%;
  max-height: 200px;
  padding: clamp(12px, 3vw, 24px);
  gap: clamp(6px, 1.5vw, 12px);
  transition: filter 0.15s ease-in-out;
  flex: 0 0 auto;
  min-width: fit-content;

  &:hover {
    filter: brightness(0.95);
    cursor: pointer;
  }
  
  /* iPad e tablets - usar grid */
  @media (max-width: 1024px) and (min-width: 769px) {
    width: 100%;
    height: clamp(160px, 20vw, 200px);
    min-height: clamp(160px, 20vw, 200px);
    max-height: clamp(160px, 20vw, 200px);
    padding: clamp(12px, 3vw, 18px);
    gap: clamp(6px, 1.5vw, 8px);
    flex: none;
    min-width: auto;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    height: clamp(160px, 25vw, 200px);
    min-height: clamp(160px, 25vw, 200px);
    max-height: clamp(160px, 25vw, 200px);
    padding: clamp(12px, 4vw, 20px);
    gap: clamp(6px, 2vw, 10px);
    flex: none;
    min-width: auto;
  }
`;

export const CardTitle = styled.h2`
  color: ${({ theme }) => theme.colorPrimaryText};
  margin: 0;
  display: flex;
  align-items: center;
  gap: clamp(4px, 1vw, 12px);
  font-size: clamp(14px, 3vw, 20px);
  line-height: 1.2;
  
  @media (max-width: 768px) {
    font-size: clamp(12px, 3.5vw, 18px);
    gap: clamp(4px, 1.5vw, 8px);
  }
`;

export const CardText = styled.span`
  color: ${({ theme }) => theme.colorPrimaryText};
  font-size: clamp(12px, 2.5vw, 16px);
  
  @media (max-width: 768px) {
    font-size: clamp(10px, 2.8vw, 14px);
  }
`;

export const Info = styled.span<InfoProps>`
  color: ${({ theme, $tertiary }) =>
    $tertiary ? theme.colorTertiary : theme.colorTextPrimary};
  font-size: clamp(12px, 2.5vw, 16px);
  font-weight: 600;
  line-height: 1.3;
  
  @media (max-width: 768px) {
    font-size: clamp(10px, 2.8vw, 14px);
  }
`;

export const Content = styled.div<{ $hasFreePlanUsage?: boolean }>`
  display: ${({ $hasFreePlanUsage }) => $hasFreePlanUsage ? "grid" : "flex"};
  flex-direction: row;
  flex-wrap: nowrap;
  grid-template-columns: repeat(5, max-content);
  grid-template-rows: 200px auto;
  grid-template-areas:
    "card1 card2 card3 card4 performance"
    "freePlan freePlan freePlan freePlan performance";
  gap: 16px;
  margin-top: 40px;
  
  /* iPad e tablets - layout 2x3 sem mascote */
  @media (max-width: 1024px) and (min-width: 769px) {
    margin-top: 20px;
    gap: 12px;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: auto auto;
    grid-template-areas: ${({ $hasFreePlanUsage }) => $hasFreePlanUsage
      ? `"card1 card2 card3" "card4 performance performance" "freePlan freePlan freePlan"`
      : `"card1 card2 card3" "card4 performance performance"`};
    width: 100%;
    max-width: 900px;
    margin-left: auto;
    margin-right: auto;
  }
  
  @media (max-width: 768px) {
    margin-top: 20px;
    gap: 12px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto auto;
    grid-template-areas: ${({ $hasFreePlanUsage }) => $hasFreePlanUsage
      ? `"freePlan freePlan" "card1 card2" "card3 card4" "performance performance"`
      : `"card1 card2" "card3 card4" "performance performance"`};
    width: 100%;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }
`;

export const RightContent = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 40px;
  margin-left: 16px;
  
  @media (max-width: 1024px) {
    display: none;
  }
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
  padding: clamp(6px, 2vw, 12px) clamp(12px, 3vw, 20px);
  border-radius: clamp(3px, 1vw, 6px);
  font-weight: 700;
  font-size: clamp(12px, 2.5vw, 16px);
  width: fit-content;
  transition: filter 0.15s ease-in-out;
  line-height: 1.2;

  &:hover {
    filter: brightness(0.95);
    cursor: pointer;
  }

  @media (max-width: 1024px) {
    font-size: clamp(10px, 2.8vw, 14px);
    padding: clamp(6px, 2.5vw, 10px) clamp(10px, 3.5vw, 16px);
  }
  
  @media (max-width: 768px) {
    font-size: clamp(10px, 2.8vw, 14px);
    padding: clamp(6px, 2.5vw, 10px) clamp(10px, 3.5vw, 16px);
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
  overflow: visible;
`;

export const PerformanceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: clamp(12px, 2.5vw, 16px);
  color: #333;
  gap: clamp(8px, 2vw, 16px);
  
  @media (max-width: 768px) {
    font-size: clamp(10px, 2.8vw, 14px);
    gap: clamp(6px, 2.5vw, 12px);
  }
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
  overflow: visible;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(7, clamp(24px, 6vw, 32px));
    gap: clamp(4px, 1.5vw, 8px);
    justify-content: center;
    margin-top: clamp(6px, 2vw, 10px);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(7, clamp(24px, 6vw, 32px));
    gap: clamp(4px, 1.5vw, 8px);
    justify-content: center;
    margin-top: clamp(6px, 2vw, 10px);
  }
`;

export const DayDot = styled.div<{ $active?: boolean, $currentDay?: boolean }>`
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
  background: ${({ $active, $currentDay, theme }) =>
    $currentDay ? "#163658" : $active ? theme.colorTertiary : "#f2f2f2"};
  color: ${({ $active, theme }) =>
    $active ? theme.colorTertiaryText : "#163658"};
  box-sizing: border-box;
  z-index: 0;
  position: relative;
  
  @media (max-width: 768px) {
    width: clamp(20px, 5vw, 28px);
    height: clamp(20px, 5vw, 28px);
    font-size: clamp(9px, 2.2vw, 12px);
  }

  &::before {
    content: attr(data-tooltip);
    position: absolute;
    bottom: 120%;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #2c3e50, #34495e);
    color: white;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 500;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    border: 1px solid rgba(255, 255, 255, 0.1);
    min-width: max-content;
    max-width: 200px;
    word-wrap: break-word;
    white-space: normal;
    text-align: center;
    pointer-events: none;
  }

  &:hover::before {
    opacity: 1;
    visibility: visible;
  }

  &:not([data-tooltip=""]):hover::before {
    opacity: 1;
    visibility: visible;
  }

  &[data-tooltip=""]:hover::before {
    opacity: 0;
    visibility: hidden;
  }

  &:not([data-tooltip=""]):nth-child(7n+1)::before {
    left: 0;
    transform: translateX(0);
  }

  &:not([data-tooltip=""]):nth-child(7n)::before {
    left: auto;
    right: 0;
    transform: translateX(0);
  }
`;
