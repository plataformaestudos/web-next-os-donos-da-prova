"use client";

import { Modal } from 'antd';
import styled from 'styled-components';
import { PlanCard } from '@/signup/signup.style';

export const UpgradeModal = styled(Modal)`
  max-width: calc(100vw - 32px);
  padding-bottom: 16px;

  .ant-modal-content {
    padding: 28px;
    border-radius: 20px;
    background: ${({ theme }) => theme.colorBgContainer};
    color: ${({ theme }) => theme.colorText};
  }

  .ant-modal-header { padding-right: 20px; background: transparent; }
  .ant-modal-title { font-size: 22px; line-height: 1.4; overflow-wrap: anywhere; }
  .ant-modal-body { max-height: calc(100dvh - 230px); overflow-y: auto; }

  @media (max-width: 480px) {
    .ant-modal-content { padding: 24px 18px 18px; }
    .ant-modal-title { font-size: 20px; }
    .ant-modal-body { max-height: calc(100dvh - 245px); }
  }
`;

export const Intro = styled.p`
  color: ${({ theme }) => theme.colorTextSecondary};
  font-size: 15px;
  line-height: 1.6;
  margin: 12px 0 20px;
`;

export const ResetNotice = styled.p`
  color: ${({ theme }) => theme.colorTextSecondary};
  font-size: 12px;
  line-height: 1.5;
  margin: 16px 0 0;
`;

export const OfferCard = styled(PlanCard)`
  cursor: default;
  gap: 12px;
  overflow-wrap: anywhere;
  &:hover { border-color: ${({ theme }) => theme.colorBorderSecondary}; }

  h3 { margin: 0; font-size: 19px; line-height: 1.4; color: ${({ theme }) => theme.colorTextHeading}; }
  p { margin: 0; color: ${({ theme }) => theme.colorTextSecondary}; line-height: 1.6; }
`;

export const Price = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  strong { color: ${({ theme }) => theme.colorTextHeading}; font-size: 26px; line-height: 1.4; }
  del, span { color: ${({ theme }) => theme.colorTextSecondary}; font-size: 13px; line-height: 1.5; }
`;

export const Modules = styled.details`
  width: 100%;
  border-top: 1px solid ${({ theme }) => theme.colorBorderSecondary};
  padding-top: 12px;
  font-size: 14px;
  line-height: 1.6;
  summary { cursor: pointer; color: ${({ theme }) => theme.colorPrimary}; font-weight: 600; }
  summary:focus-visible { outline: 2px solid ${({ theme }) => theme.colorPrimary}; outline-offset: 4px; border-radius: 2px; }
  ul { padding-left: 20px; margin-bottom: 0; }
`;

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 12px;
  .ant-btn { height: 44px; }
  @media (max-width: 480px) {
    flex-direction: column-reverse;
    .ant-btn { width: 100%; }
  }
`;

export const Status = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px 12px;
  color: ${({ theme }) => theme.colorTextSecondary};
  line-height: 1.6;
`;
