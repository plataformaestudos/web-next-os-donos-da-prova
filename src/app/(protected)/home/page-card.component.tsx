"use client";

import Link from "next/link";
import styled from "styled-components";

export const CardsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
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

  width: 100%;
  height: 160px;

  @media (min-width: 640px) {
    width: 160px;
    height: 160px;
  }

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

export const CardLink = styled(Link)`
  flex-basis: calc(50% - 8px);

  @media (min-width: 640px) {
    flex-basis: auto;
  }
`;
