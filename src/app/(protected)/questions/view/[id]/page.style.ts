import styled from "styled-components";

export const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 16px 32px;
`;



export const TabContainer = styled.div`
  padding: 8px 24px 24px;
  background-color: ${({ theme }) => theme.colorBgContainer};
  border-radius: 6px;
`;

export const QuestionHeader = styled.div`
  margin-bottom: 24px;
`;

export const ModuleInfo = styled.div`
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: bold;
  color: ${({ theme }) => theme.colorPrimaryText};
`;

export const QuestionViewContainer = styled.div`
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: -20px;
    left: -20px;
    width: calc(100% + 30px);
    height: calc(100% + 30px);
    opacity: 0.05;
    background-image: url("/images/watermark.png");
    pointer-events: none;
    filter: ${({ theme }) => (theme.isDark ? "invert(1) brightness(0.65)" : "none")};
    z-index: 2;
  }
`;

export const QuestionContent = styled.div`
  position: relative;
  z-index: 1;
`;

export const TabContent = styled.div`
  position: relative;
  z-index: 2;
`;

export const QuestionContainer = styled.div`
  margin-bottom: 24px;
`;

export const AlternativesContainer = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid ${(props) => props.theme.colorBorder};
  border-radius: 6px;
  margin-top: 16px;
  
`;

export const AlternativeLetter = styled.span<{ $selected: boolean; $correct?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  font-size: 12px;
  line-height: 16px;
  border-radius: 12px;
  border: 1px solid;
  border-color: ${(props) => {
    if (props.$correct) return props.theme.colorSuccess;
    return props.$selected ? props.theme.colorPrimary : props.theme.colorBorder;
  }};
  background-color: ${(props) => {
    if (props.$correct) return props.theme.colorSuccess;
    return props.$selected ? props.theme.colorPrimary : props.theme.colorBgContainer;
  }};
  color: ${(props) => {
    if (props.$correct || props.$selected) return props.theme.colorTextLightSolid;
    return props.theme.colorText;
  }};
`;

export const Alternative = styled.div<{
  $correct: boolean;
  $showAnswer: boolean;
}>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  transition: background-color 300ms ease-in-out;
  min-height: 50px;

  &:not(:last-child) {
    border-bottom: 1px solid ${(props) => props.theme.colorBorder};
  }

  &:first-child {
    border-radius: 6px 6px 0 0;
  }

  &:last-child {
    border-radius: 0 0 6px 6px;
  }

  background-color: ${({ $correct, $showAnswer, theme }) =>
    $showAnswer && $correct
      ? theme.colorSuccessBg
      : theme.colorBgContainer};
`;
