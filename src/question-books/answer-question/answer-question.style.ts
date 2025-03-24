"use client";

import styled, { css } from "styled-components";

export const Container = styled.div`
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
  }
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

export const AlternativeLetter = styled.span<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 24px;
  height: 24px;

  font-size: 12px;
  line-height: 16px;

  border-radius: 12px;

  border: 1px solid;
  border-color: ${(props) =>
    props.$selected ? props.theme.colorPrimary : props.theme.colorBorder};
  background-color: ${(props) =>
    props.$selected ? props.theme.colorPrimary : props.theme.colorBgContainer};
  color: ${(props) => props.$selected && props.theme.colorTextLightSolid};
`;

export const Alternative = styled.div<{
  $lineThrough: boolean;
  $disabled: boolean;
  $correct: boolean;
  $incorrect: boolean;
}>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  transition: background-color 300ms ease-in-out;
  min-height: 50px;

  button {
    display: none;
  }

  ${({ $disabled }) =>
    !$disabled &&
    css`
      &:hover {
        background-color: ${(props) => props.theme.colorFillTertiary};

        button {
          display: block;
        }
      }
      cursor: pointer;
    `}

  &:not(:last-child) {
    border-bottom: 1px solid ${(props) => props.theme.colorBorder};
  }

  &:first-child {
    border-radius: 6px 6px 0 0;
  }

  &:last-child {
    border-radius: 0 0 6px 6px;
  }

  background-color: ${({ $correct, $incorrect, theme }) =>
    $correct
      ? theme.colorSuccessBg
      : $incorrect
      ? theme.colorErrorBg
      : theme.colorBgContainer};

  ${({ $lineThrough }) =>
    $lineThrough &&
    css`
      text-decoration: line-through;
    `}
`;
