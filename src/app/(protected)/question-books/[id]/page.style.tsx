"use client";

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
