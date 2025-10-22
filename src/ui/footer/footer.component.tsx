"use client";

import React from "react";
import { Typography, Button } from "antd";
import styled from "styled-components";

const { Text } = Typography;

const FooterContainer = styled.footer`
  background-color: ${({ theme }) => theme.colorPrimaryBg};
  color: ${({ theme }) => theme.colorPrimaryText};
  padding: clamp(8px, 2vw, 16px) clamp(16px, 4vw, 32px);
  border-top: 1px solid ${({ theme }) => theme.colorPrimaryBg};
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: clamp(12px, 3vw, 24px);
  /* min-height: clamp(40px, 8vh, 48px); */
  margin-top: auto;
  width: 100%;
  box-sizing: border-box;
  
  @media (max-width: 768px) {
    display: block;
    text-align: center;
    padding: clamp(8px, 2vw, 16px) clamp(12px, 3vw, 20px);
  }
`;

const CopyrightText = styled(Text)`
  color: ${({ theme }) => theme.colorPrimaryText} !important;
  font-size: clamp(10px, 2.5vw, 12px);
  margin: 0;
  line-height: 1.4;
  
  @media (max-width: 768px) {
    display: block;
    margin-bottom: 12px;
  }
  
  @media (max-width: 480px) {
    font-size: clamp(9px, 2vw, 11px);
  }
`;

const LinksContainer = styled.div`
  display: flex;
  gap: clamp(16px, 4vw, 24px);
  align-items: center;
  flex-wrap: wrap;
  max-width: 100%;
  
  @media (max-width: 768px) {
    display: flex;
    justify-content: center;
    gap: clamp(8px, 2vw, 16px);
    flex-wrap: nowrap;
    width: 100%;
  }
`;

const FooterLink = styled(Button)`
  color: ${({ theme }) => theme.colorPrimaryText} !important;
  background: transparent !important;
  border: none !important;
  padding: clamp(4px, 1vw, 8px) clamp(8px, 2vw, 12px) !important;
  font-size: clamp(10px, 2.5vw, 12px) !important;
  line-height: 1.4;
  white-space: nowrap;
  
  &:hover {
    color: ${({ theme }) => theme.colorPrimary} !important;
    background: rgba(0, 0, 0, 0.05) !important;
    border-radius: 4px;
  }
  
  @media (max-width: 768px) {
    font-size: clamp(9px, 1.5vw, 11px) !important;
    padding: clamp(2px, 0.5vw, 4px) clamp(3px, 0.8vw, 6px) !important;
    white-space: nowrap;
    text-align: center;
    flex-shrink: 1;
    min-width: 0;
    max-width: 50%;
  }
`;

export function Footer() {
    const currentYear = new Date().getFullYear();

    const handleTermsClick = () => {
        window.open('/termos-de-uso', '_blank');
    };

    const handlePrivacyClick = () => {
        window.open('/politica-privacidade', '_blank');
    };

    return (
        <FooterContainer>
            <CopyrightText>
                © {currentYear} Os Donos da Prova. Todos os direitos reservados.
            </CopyrightText>

            <LinksContainer>
                <FooterLink
                    type="link"
                    onClick={handleTermsClick}
                >
                    Termos de Uso
                </FooterLink>

                <FooterLink
                    type="link"
                    onClick={handlePrivacyClick}
                >
                    Política de Privacidade
                </FooterLink>
            </LinksContainer>

        </FooterContainer>
    );
}

// Footer específico para páginas públicas (sem margin-left)
const PublicFooterContainer = styled.footer`
  background-color: ${({ theme }) => theme.colorPrimaryBg};
  color: ${({ theme }) => theme.colorPrimaryText};
  padding: clamp(8px, 2vw, 16px) clamp(16px, 4vw, 32px);
  border-top: 1px solid ${({ theme }) => theme.colorPrimaryBg};
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: clamp(12px, 3vw, 24px);
  min-height: clamp(40px, 8vh, 48px);
  margin-top: auto;
  width: 100%;
  box-sizing: border-box;
  
  @media (max-width: 768px) {
    display: block;
    text-align: center;
    padding: clamp(8px, 2vw, 16px) clamp(12px, 3vw, 20px);
  }
`;

export function PublicFooter() {
    const currentYear = new Date().getFullYear();

    const handleTermsClick = () => {
        window.open('/termos-de-uso', '_blank');
    };

    const handlePrivacyClick = () => {
        window.open('/politica-privacidade', '_blank');
    };

    return (
        <PublicFooterContainer>
            <LinksContainer>
                <FooterLink
                    type="link"
                    onClick={handleTermsClick}
                >
                    Termos de Uso
                </FooterLink>

                <FooterLink
                    type="link"
                    onClick={handlePrivacyClick}
                >
                    Política de Privacidade
                </FooterLink>
            </LinksContainer>

            <CopyrightText>
                © {currentYear} Os Donos da Prova. Todos os direitos reservados.
            </CopyrightText>
        </PublicFooterContainer>
    );
}
