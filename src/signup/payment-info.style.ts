"use client";

import styled from "styled-components";

export const PaymentSection = styled.section`
  min-width: 0;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid ${({ theme }) => theme.colorBorderSecondary};

  .payment-section-title {
    margin: 0 0 20px;
    color: ${({ theme }) => theme.colorText};
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .ant-form-item { margin-bottom: 20px; }
  .ant-form-item-label > label { font-weight: 600; }
  .ant-form-item-control-input input {
    min-width: 0;
    height: 46px;
    padding: 10px 14px;
    border-radius: 10px;
  }

  input:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colorPrimary};
    outline-offset: 2px;
  }

  .payment-card-row {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  .payment-card-help {
    color: ${({ theme }) => theme.colorTextSecondary};
    font-size: 12px;
    line-height: 1.5;
  }

  .payment-save-card { margin-bottom: 0; }

  .ant-checkbox-wrapper {
    align-items: flex-start;
    line-height: 1.6;
  }

  @media (max-width: 480px) {
    .payment-card-row { grid-template-columns: minmax(0, 1fr); gap: 0; }
  }
`;

export const PaymentConsents = styled.div`
  display: grid;
  gap: 14px;
  margin-top: 20px;
  text-align: left;

  .ant-checkbox-wrapper {
    align-items: flex-start;
    margin-inline-start: 0;
    font-size: 13px;
    line-height: 1.7;
  }

  && a {
    color: ${({ theme }) => theme.isDark ? theme.colorText : theme.colorPrimary};
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  && a:focus-visible {
    outline: 2px solid ${({ theme }) => theme.isDark ? theme.colorText : theme.colorPrimary};
    outline-offset: 3px;
    border-radius: 2px;
  }
`;
