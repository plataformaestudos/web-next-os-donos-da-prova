"use client";

import styled from "styled-components";

export const QuestionFormContainer = styled.div`
  padding: 16px 16px 64px;
  border-radius: 6px;
  background-color: ${(props) => props.theme.colorBgContainer};
`;

export const Label = styled.p`
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 8px;
`;

export const Alternative = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 20px;
  }

  svg {
    color: ${(props) => props.theme.colorTextPlaceholder} !important;
  }
`;
