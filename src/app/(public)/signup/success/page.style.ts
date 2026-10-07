"use client";

import styled from "styled-components";
import { Card as CheckoutCard, Container as CheckoutContainer } from "@/signup/signup.style";

export const Container = styled(CheckoutContainer)`
  justify-content: center;
`;

export const Card = styled(CheckoutCard)`
  align-items: center;
  max-width: 560px;
  padding: 40px 32px;
  text-align: center;

  @media (max-width: 640px) {
    padding: 32px 20px;
  }
`;

export const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  margin-bottom: 24px;
  border-radius: 50%;
  color: ${({ theme }) => theme.colorSuccessText};
  background-color: ${({ theme }) => theme.colorSuccessBg};
  font-size: 44px;
`;

export const MessageContainer = styled.div`
  width: 100%;
  margin-top: 16px;
  color: ${({ theme }) => theme.colorTextSecondary};
  line-height: 1.6;

  p {
    margin: 0;
  }
`;

export const ButtonContainer = styled.div`
  width: 100%;
  margin-top: 28px;

  .ant-btn {
    min-height: 48px;
    border-radius: 10px;
    font-weight: 600;
  }
`;
