"use client";

import styled from "styled-components";

export const QuestionsContainer = styled.div`
  padding: 16px 32px;
  width: 100%;
`;

export const QuestionsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding-bottom: 16px;

  margin-bottom: 16px;

  border-bottom: 1px solid ${({ theme }) => theme.colorBorder};
`;

export const Title = styled.h1`
  font-size: 36px;
  line-height: 40px;
  font-weight: bold;
`;
