"use client";

import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  cursor: pointer;
`;

export const TitleContainer = styled.div`
  h1 {
    font-size: 20px;
    line-height: 1;
    font-weight: bold;
  }

  span {
    font-size: 12px;
    color: ${({ theme }) => theme.colorTextDescription};
  }
`;
