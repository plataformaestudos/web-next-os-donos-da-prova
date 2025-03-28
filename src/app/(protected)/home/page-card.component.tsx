"use client";

import styled from "styled-components";

export const CardsContainer = styled.div`
  display: flex;
  gap: 16px;

  margin-top: 24px;
`;

export const Card = styled.div`
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;

  width: 160px;
  height: 160px;
  padding: 18px 24px;
  background-color: ${({ theme }) => theme.colorFillContent};
  border-radius: 12px;
  transition: background-color 200ms ease-in-out;

  color: ${({ theme }) => theme.colorTextHeading};

  h3 {
    margin: 0;
  }

  &:hover {
    background-color: ${({ theme }) => theme.colorFillContentHover};
  }
`;
