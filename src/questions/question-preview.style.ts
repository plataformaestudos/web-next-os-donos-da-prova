"use client";

import styled from "styled-components";

export const PreviewContainer = styled.div`
  background-color: ${({ theme }) => theme.colorBgContainer};
  border-radius: 6px;
  padding: 18px 24px 24px;
`;

export const AlternativesContainer = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid ${(props) => props.theme.colorBorder};
  border-radius: 6px;

  margin-top: 16px;
`;

export const Alternative = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  cursor: pointer;
  transition: background-color 300ms ease-in-out;

  &:hover {
    background-color: ${(props) => props.theme.colorFillTertiary};
  }

  &:not(:last-child) {
    border-bottom: 1px solid ${(props) => props.theme.colorBorder};
  }

  &:first-child {
    border-radius: 6px 6px 0 0;
  }

  &:last-child {
    border-radius: 0 0 6px 6px;
  }
`;

export const AlternativeLetter = styled.span<{ $correct: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 24px;
  height: 24px;

  font-size: 12px;
  line-height: 16px;

  border-radius: 12px;

  background-color: ${(props) =>
    props.$correct ? props.theme.colorPrimary : props.theme.colorBgContainer};
  color: ${(props) => props.$correct && props.theme.colorTextLightSolid};
`;
