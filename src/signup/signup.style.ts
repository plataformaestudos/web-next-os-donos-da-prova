"use client";

import styled, { css } from "styled-components";

export const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background-color: ${({ theme }) => theme.colorFillContent};
`;

export const Card = styled.div`
  width: calc(100% - 24px);
  height: calc(100% - 24px);
  max-width: 896px;
  max-height: 896px;
  padding: 24px;

  border-radius: 6px;
  background-color: ${({ theme }) => theme.colorBgContainer};

  display: flex;
  flex-direction: column;
`;

export const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const PlanCard = styled.div<{ $selected: boolean }>`
  border: 1px solid ${({ theme }) => theme.colorBorder};
  padding: 8px 12px;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;

  border-radius: 10px;

  transition: border-color 200ms ease-in-out, background-color 200ms ease-in-out;
  cursor: pointer;
  height: 180px;

  flex-basis: calc(50% - 6px);

  @media (max-width: 640px) {
    flex-basis: 100%;
  }

  &:hover {
    border-color: ${({ theme }) => theme.colorPrimaryActive};
  }

  ${({ $selected }) =>
    $selected &&
    css`
      border-color: ${({ theme }) => theme.colorPrimaryActive};
      background-color: ${({ theme }) => theme.colorPrimaryActive};
      color: #fff;
    `}
`;

export const PlansContainer = styled.div`
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 0 16px 16px 0;

  @media (max-width: 640px) {
    padding: 0;
  }
`;

export const PlansModules = styled.div`
  flex: 1;
  overflow-y: auto;
  max-height: 100px;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.colorBorder};
    border-radius: 10px;
  }

  &::-webkit-scrollbar-track {
    border-radius: 4px;
    background-color: ${({ theme }) => theme.colorBgContainerDisabled};
  }

  ul {
    display: flex;
    flex-wrap: wrap;

    li {
      flex-basis: calc(50% - 20px);
    }
  }
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;

  margin-bottom: 24px;

  overflow-y: auto;
  overflow-x: hidden;

  &::-webkit-scrollbar {
    height: 6px;
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.colorBorder};
    border-radius: 10px;
  }

  &::-webkit-scrollbar-track {
    border-radius: 4px;
    background-color: ${({ theme }) => theme.colorBgContainerDisabled};
  }
`;
