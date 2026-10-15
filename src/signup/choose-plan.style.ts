"use client";

import { Select } from "antd";
import styled from "styled-components";
import { PlanCard } from "./signup.style";

export const PlanFlipCard = styled.article`
  min-width: 0;
  perspective: 1000px;
`;

export const PlanFlipInner = styled.div<{ $flipped: boolean }>`
  display: grid;
  height: 100%;
  min-width: 0;
  transform-style: preserve-3d;
  transform: ${({ $flipped }) => $flipped ? "rotateY(180deg)" : "rotateY(0deg)"};
  transition: transform 500ms ease;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

export const PlanFlipFace = styled(PlanCard)<{ $back?: boolean }>`
  grid-area: 1 / 1;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  transform: ${({ $back }) => $back ? "rotateY(180deg)" : "rotateY(0deg)"};
  cursor: default;
`;

export const PlanSearchHeader = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 13px;

  label { font-weight: 600; }
  .ant-typography { font-size: 12px; }
`;

export const PlanSelection = styled.button`
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  width: 100%;
  min-width: 0;
  padding: 0;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;

  &:focus-visible {
    outline: 3px solid ${({ theme }) => theme.colorPrimary};
    outline-offset: 6px;
  }
`;

export const PlanHeading = styled.span`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  width: 100%;

  strong {
    margin: 0;
    color: ${({ theme }) => theme.colorTextHeading};
    font-size: 16px;
    line-height: 1.45;
    overflow-wrap: anywhere;
  }
`;

export const PlanSelectionIndicator = styled.span<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border: 1px solid ${({ theme, $selected }) => $selected ? theme.colorPrimary : theme.colorBorder};
  border-radius: 50%;
  background: ${({ theme, $selected }) => $selected ? theme.colorPrimary : theme.colorBgContainer};
  color: ${({ theme }) => theme.colorTextLightSolid};
  font-size: 12px;
`;

export const PlanDescription = styled.span`
  color: ${({ theme }) => theme.colorTextSecondary};
  font-size: 13px;
  line-height: 1.6;
  overflow-wrap: anywhere;
`;

export const PlanPrice = styled.span`
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: center;
  gap: 4px;
  margin-top: 4px;

  strong {
    color: ${({ theme }) => theme.colorTextHeading};
    font-size: 24px;
    line-height: 1.3;
  }

  span {
    color: ${({ theme }) => theme.colorTextSecondary};
    font-size: 12px;
    line-height: 1.5;
  }

  del {
    color: ${({ theme }) => theme.colorTextSecondary};
    font-size: 14px;
    line-height: 1.5;
  }
`;

export const ModuleActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 4px 12px;
  width: 100%;
  padding-top: 12px;
  border-top: 1px solid ${({ theme }) => theme.colorBorderSecondary};

  .ant-typography { font-size: 12px; }
  .ant-btn {
    min-height: 44px;
    padding: 0;
    font-size: 12px;
  }
`;

export const CycleSelect = styled(Select<string>)`
  width: 100%;
  margin-top: 8px;
  min-width: 0;
  && { height: auto; min-height: 44px; }

  && .ant-select-selector { min-height: 44px; height: auto; }
  && .ant-select-selector .ant-select-selection-item {
    height: auto;
    white-space: normal;
    overflow-wrap: anywhere;
    line-height: 1.5;
    padding-block: 8px;
  }
`;

export const CyclePopup = styled.div`
  && .ant-select-item-option-content {
    white-space: normal;
    overflow-wrap: anywhere;
  }
`;

export const CycleOption = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 6px 12px;
  padding-block: 4px;
  line-height: 1.5;

  small {
    padding: 2px 6px;
    border-radius: 6px;
    background: ${({ theme }) => theme.colorPrimaryBg};
    color: ${({ theme }) => theme.colorText};
    font-size: 11px;
    font-weight: 600;
  }
`;
