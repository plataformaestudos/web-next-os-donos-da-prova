"use client";

import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  width: 100%;
  min-width: 0;
  min-height: calc(100svh - 40px);
  padding: 28px 0 24px;
  color: ${({ theme }) => theme.colorText};
  background: radial-gradient(ellipse at top, ${({ theme }) => theme.colorBgContainer} 0%, ${({ theme }) => theme.colorPrimaryBg} 72%);

  @media (max-width: 640px) {
    gap: 20px;
    padding: 8px 0 20px;
  }
`;

export const Card = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 896px;
  min-width: 0;
  box-sizing: border-box;
  padding: 36px 40px 28px;
  border: 1px solid ${({ theme }) => theme.colorBorderSecondary};
  border-radius: 24px;
  background-color: ${({ theme }) => theme.colorBgContainer};
  box-shadow: 0 12px 36px ${({ theme }) => theme.isDark ? "#00000030" : "#1636580a"};

  @media (max-width: 640px) {
    padding: 24px 18px 20px;
    border-radius: 20px;
  }
`;

export const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  text-align: center;
`;

export const ProgressContainer = styled.div`
  width: 100%;
  max-width: 600px;
  margin-bottom: 28px;

  .ant-steps-item-title {
    font-size: 13px;
  }

  @media (max-width: 480px) {
    .ant-steps-item-title {
      font-size: 11px;
      padding-inline-end: 4px;
    }

    .ant-steps-item-icon {
      margin-inline-end: 4px;
    }

    .ant-steps-item-container {
      min-height: 44px;
      align-items: center;
    }
  }
`;

export const StageHeading = styled.h1`
  margin: 0;
  color: ${({ theme }) => theme.colorTextHeading};
  font-size: 28px;
  font-weight: 700;
  line-height: 1.3;

  @media (max-width: 640px) {
    font-size: 24px;
  }
`;

export const StageDescription = styled.p`
  margin: 8px 0 0;
  color: ${({ theme }) => theme.colorTextSecondary};
  font-size: 14px;
  line-height: 1.6;
`;

export const Footer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid ${({ theme }) => theme.colorBorderSecondary};

  .ant-btn {
    min-height: 44px;
  }

  .ant-btn-primary {
    min-width: 148px;
    border-radius: 10px;
    font-weight: 600;
  }

  @media (max-width: 480px) {
    .ant-btn-primary {
      min-width: 0;
      padding-inline: 14px;
    }
  }
`;

export const PlanCard = styled.div<{ $selected: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  min-width: 0;
  padding: 20px;
  border: 2px solid ${({ theme, $selected }) => $selected ? theme.colorPrimary : theme.colorBorderSecondary};
  border-radius: 16px;
  background-color: ${({ theme }) => theme.colorBgContainer};
  color: ${({ theme }) => theme.colorText};
  box-shadow: ${({ $selected, theme }) => $selected ? `0 0 0 3px ${theme.colorPrimaryBg}` : "none"};
  transition: border-color 180ms ease, box-shadow 180ms ease;
  cursor: pointer;

  &:hover {
    border-color: ${({ theme }) => theme.colorPrimary};
  }

  &:focus-visible {
    outline: 3px solid ${({ theme }) => theme.colorPrimary};
    outline-offset: 4px;
  }

  &[aria-disabled="true"] {
    cursor: not-allowed;
    background-color: ${({ theme }) => theme.colorBgContainerDisabled};
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

export const PlansContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  width: 100%;

  @media (max-width: 640px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const PlansModules = styled.div`
  width: 100%;
  min-width: 0;

  ul {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px 20px;
    padding-left: 20px;
  }

  li {
    overflow-wrap: anywhere;
  }

  @media (max-width: 480px) {
    ul {
      grid-template-columns: minmax(0, 1fr);
    }
  }
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  width: 100%;
  margin-top: 28px;
`;

export const Span = styled.span`
  color: ${({ theme }) => theme.isDark ? theme.colorText : theme.colorPrimary};
  cursor: pointer;
  font-weight: 600;

  &:hover {
    text-decoration: underline;
  }
`;

export const CheckoutLogin = styled.p`
  margin: 0;
  text-align: center;
  font-size: 13px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colorTextSecondary};

  a {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    margin-left: 4px;
    border-radius: 4px;
    color: ${({ theme }) => theme.isDark ? theme.colorText : theme.colorPrimary};
    font-weight: 600;
  }

  a:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colorPrimary};
    outline-offset: 4px;
  }
`;
