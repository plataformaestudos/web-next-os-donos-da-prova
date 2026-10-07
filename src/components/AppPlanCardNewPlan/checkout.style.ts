"use client";

import styled from "styled-components";
import { AppConfirmModal } from "../AppConfirmModal";

export const PlanCheckoutModal = styled(AppConfirmModal)`
  .ant-modal-content {
    padding: 32px;
    border-radius: 20px;
    background: ${({ theme }) => theme.colorBgContainer};
  }

  .ant-modal-title {
    display: block;
    padding-inline: 12px;
    color: ${({ theme }) => theme.colorText};
    font-size: 24px;
    font-weight: 700;
    text-align: center;
  }

  .ant-modal-body > div[style] {
    margin-top: 20px !important;
    margin-bottom: 24px !important;
  }

  .plan-checkout-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
    text-align: left;
    min-width: 0;
  }

  .plan-checkout-intro {
    margin: 0;
    color: ${({ theme }) => theme.colorTextSecondary};
    line-height: 1.6;
    text-align: center;
  }

  .plan-checkout-cycle {
    display: grid;
    gap: 10px;
    min-width: 0;
  }

  .plan-checkout-cycle > label {
    font-size: 13px;
    font-weight: 700;
    color: ${({ theme }) => theme.colorText};
  }

  .plan-checkout-cycle .ant-select-selector {
    border-radius: 10px;
  }

  .plan-checkout-unavailable {
    color: ${({ theme }) => theme.colorError};
    font-size: 14px;
  }

  .ant-modal-body > .ant-flex {
    padding-top: 20px;
    border-top: 1px solid ${({ theme }) => theme.colorBorderSecondary};
  }

  .ant-modal-body > .ant-flex > .ant-btn {
    min-height: 46px;
    border-radius: 10px;
    font-weight: 600;
  }

  .ant-modal-body > .ant-flex > .ant-btn:last-child:not(:disabled) {
    color: ${({ theme }) => theme.colorTextLightSolid};
    background: ${({ theme }) => theme.colorPrimary};
    border-color: ${({ theme }) => theme.colorPrimary};
  }

  .ant-modal-body > .ant-flex > .ant-btn:last-child:not(:disabled):hover {
    background: ${({ theme }) => theme.colorPrimaryHover};
    border-color: ${({ theme }) => theme.colorPrimaryHover};
  }

  .ant-btn:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colorPrimary};
    outline-offset: 3px;
  }

  @media (max-width: 480px) {
    .ant-modal-content { padding: 28px 18px 20px; }
    .ant-modal-body > .ant-flex { flex-wrap: wrap; }
    .ant-modal-body > .ant-flex > .ant-btn { flex: 1 1 130px; padding-inline: 12px; }
  }
`;
