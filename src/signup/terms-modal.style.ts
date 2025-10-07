"use client";

import styled from "styled-components";

export const TermsModal = styled.div`
  .ant-modal-content {
    background-color: ${({ theme }) => theme.colorPrimaryBg};
  }

  .ant-modal-header {
    background-color: ${({ theme }) => theme.colorPrimaryBg};
    border-bottom: 1px solid ${({ theme }) => theme.colorBorder};
    padding: 16px 24px;
    margin: 0;
  }

  .ant-modal-footer {
    background-color: ${({ theme }) => theme.colorPrimaryBg};
    border-top: 1px solid ${({ theme }) => theme.colorBorder};
    padding: 16px 24px;
    margin: 0;
    text-align: right;
  }

  .ant-modal-body {
    padding: 0;
  }
`;

export const ModalHeader = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colorText};
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const ModalContent = styled.div`
  background-color: ${({ theme }) => theme.colorBgContainer};
  color: ${({ theme }) => theme.colorText};
  border-radius: 8px;
  margin: 16px;
  padding: 24px;
  border: 1px solid ${({ theme }) => theme.colorBorder};
  min-height: 400px;
  max-height: 65vh;
  overflow-y: auto;

  /* Custom scrollbar using theme colors */
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colorFillQuaternary};
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colorPrimary};
    border-radius: 4px;
    transition: all 0.3s ease;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colorPrimaryHover};
  }

  /* Firefox scrollbar styling */
  scrollbar-width: thin;
  scrollbar-color: ${({ theme }) => theme.colorPrimary} ${({ theme }) => theme.colorFillQuaternary};
`;

export const ContentText = styled.div`
  line-height: 1.6;
  color: ${({ theme }) => theme.colorText};
  font-size: 14px;

  h1 {
    color: ${({ theme }) => theme.colorPrimary};
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 2px solid ${({ theme }) => theme.colorPrimary};
  }

  h2 {
    color: ${({ theme }) => theme.colorText};
    font-size: 16px;
    font-weight: 600;
    margin: 20px 0 12px 0;
  }

  p {
    color: ${({ theme }) => theme.colorTextSecondary};
    margin-bottom: 12px;
  }

  ul, ol {
    color: ${({ theme }) => theme.colorTextSecondary};
    padding-left: 20px;
  }

  li {
    margin-bottom: 8px;
  }
`;

export const TermsLink = styled.span`
  color: ${({ theme }) => theme.colorPrimary};
  text-decoration: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    color: ${({ theme }) => theme.colorPrimaryHover};
    text-decoration: none;
  }
`;

export const CloseButton = styled.button`
  background: ${({ theme }) => theme.colorPrimary} !important;
  border-color: ${({ theme }) => theme.colorPrimary} !important;
  color: ${({ theme }) => theme.colorPrimaryText} !important;
  border-radius: 6px;
  font-weight: 500;
  height: 36px;
  padding: 0 20px;
  transition: all 0.3s ease;

  &:hover {
    background: ${({ theme }) => theme.colorPrimaryHover} !important;
    border-color: ${({ theme }) => theme.colorPrimaryHover} !important;
    color: ${({ theme }) => theme.colorPrimaryText} !important;
  }
`;

/* Responsive design */
export const ResponsiveWrapper = styled.div`
  @media (max-width: 768px) {
    .ant-modal-content {
      margin: 8px;
      padding: 16px;
    }

    .ant-modal-header {
      padding: 12px 16px;
      font-size: 16px;
    }

    .ant-modal-footer {
      padding: 12px 16px;
    }

    ${ContentText} {
      font-size: 13px;

      h1 {
        font-size: 18px;
      }

      h2 {
        font-size: 15px;
      }
    }
  }
`;
