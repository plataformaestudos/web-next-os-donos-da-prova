"use client";

import React, { useState, useEffect } from "react";
import { Typography, Button, Spin, Alert, Card, Anchor } from "antd";
import { useRouter } from "next/navigation";
import { getTermsFromAPI } from "@/terms/terms-client.action";
import { TermsOfUse, PrivacyPolicy, LegalNotice, CancellationPolicy, AcceptanceTerms, AutoRenewalTerms } from "@/types/terms.types";
import styled from "styled-components";
import Image from "next/image";

const { Title, Paragraph } = Typography;
const { Link } = Anchor;

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  border-radius: 8px;
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  padding: 20px;
  
  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const ContentWrapper = styled.div`
  width: 100%;
  max-width: 1200px;
  display: flex;
  gap: 24px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0;
  }
`;

const Sidebar = styled.div`
  width: 280px;
  position: sticky;
  top: 20px;
  height: fit-content;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const SidebarCard = styled(Card)`
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  background-color: #ffffff !important;
  border: none !important;
  
  .ant-card-body {
    padding: 20px;
    background-color: #ffffff !important;
  }
  
  .ant-anchor {
    color: #000000 !important;
  }
  
  .ant-anchor-link {
    color: #000000 !important;
    font-weight: 500 !important;
    
  }
  
  .ant-anchor-link:hover {
    color: #1890ff !important;
    background-color: #f5f5f5 !important;
  }
  
  .ant-anchor-link-title {
    color: #000000 !important;
  }
`;

const ContentArea = styled.div`
  flex: 1;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 1px solid #e5e7eb;
`;

const LogoSection = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px 32px 0;
  background-color: #163658;
  
  @media (max-width: 768px) {
    padding: 20px 20px 0;
  }
`;

const LogoContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Header = styled.div`
  background-color: #163658;
  color: #ffffff;
  padding: 20px 32px;
  text-align: center;
  position: relative;
  
  @media (max-width: 768px) {
    padding: 16px 20px;
  }
`;

const HeaderContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
`;

const HeaderTitle = styled(Title)`
  color: #ffffff !important;
  margin-bottom: 8px !important;
  font-size: 1.8rem !important;
  font-weight: 600 !important;
  
  @media (max-width: 768px) {
    font-size: 1.5rem !important;
  }
  
  @media (max-width: 480px) {
    font-size: 1.3rem !important;
  }
`;

const HeaderSubtitle = styled(Paragraph)`
  color: #ffffff !important;
  font-size: 0.9rem !important;
  margin-bottom: 0 !important;
  opacity: 0.9;
  
  @media (max-width: 768px) {
    font-size: 0.8rem !important;
  }
`;

const Content = styled.div`
  padding: 32px;
  
  @media (max-width: 768px) {
    padding: 20px;
  }
  
  @media (max-width: 480px) {
    padding: 16px;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
`;

const ErrorContainer = styled.div`
  padding: 32px;
  text-align: center;
  
  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const Section = styled.div`
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e5e7eb;
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
  
  @media (max-width: 768px) {
    margin-bottom: 24px;
    padding-bottom: 16px;
  }
`;

const SectionTitle = styled(Title)`
  color: #000000 !important;
  margin-bottom: 16px !important;
  font-size: 1.3rem !important;
  font-weight: 600 !important;
  display: flex;
  align-items: center;
  gap: 10px;
  
  @media (max-width: 768px) {
    font-size: 1.1rem !important;
    margin-bottom: 12px !important;
    gap: 6px;
  }
  
  @media (max-width: 480px) {
    font-size: 1rem !important;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
`;

const SectionContent = styled.div`
  line-height: 1.8;
  font-size: 16px;
  color: #000000;
  
  h1, h2, h3, h4, h5, h6 {
    color: #000000;
    margin-top: 2rem;
    margin-bottom: 1rem;
  }
  
  p {
    margin-bottom: 1.5rem;
    color: #000000;
  }
  
  ul, ol {
    margin-bottom: 1.5rem;
    padding-left: 2rem;
  }
  
  li {
    margin-bottom: 0.5rem;
    color: #000000;
  }
  
  strong {
    color: #000000;
    font-weight: 600;
  }
  
  a {
    color: #1890ff;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  @media (max-width: 768px) {
    font-size: 15px;
    line-height: 1.7;
    
    h1, h2, h3, h4, h5, h6 {
      margin-top: 1.5rem;
      margin-bottom: 0.8rem;
    }
    
    p {
      margin-bottom: 1.2rem;
    }
    
    ul, ol {
      padding-left: 1.5rem;
      margin-bottom: 1.2rem;
    }
  }
  
  @media (max-width: 480px) {
    font-size: 14px;
    line-height: 1.6;
    
    ul, ol {
      padding-left: 1.2rem;
    }
  }
`;

const VersionBadge = styled.div`
  display: inline-block;
  background-color: #f5f5f5;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  margin-top: 8px;
  color: #000000;
  font-weight: 500;
  border: 1px solid #e5e7eb;
  
  @media (max-width: 768px) {
    font-size: 0.7rem;
    padding: 3px 6px;
    margin-top: 6px;
  }
`;

const LastUpdated = styled.div`
  text-align: center;
  padding: 16px;
  background-color: #f5f5f5;
  color: #000000;
  font-size: 0.85rem;
  border-top: 1px solid #e5e7eb;
  
  @media (max-width: 768px) {
    padding: 12px;
    font-size: 0.8rem;
  }
`;

const NavigationTitle = styled(Title)`
  color: #000000 !important;
  margin-bottom: 16px !important;
  font-size: 1.1rem !important;
  font-weight: 600 !important;
`;


const MobileNavigation = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: block;
    background-color: #ffffff;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border: 1px solid #e5e7eb;
  }
`;

const MobileNavTitle = styled(Title)`
  color: #000000 !important;
  margin-bottom: 16px !important;
  font-size: 1.1rem !important;
  font-weight: 600 !important;
  text-align: center;
`;

const MobileNavLinks = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  justify-items: center;
`;

const MobileNavLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  background-color: #f5f5f5;
  color: #000000 !important;
  text-decoration: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s ease;
  border: 1px solid #e5e7eb;
  min-height: 44px;
  text-align: center;
  
  &:hover {
    background-color: #1890ff;
    color: #ffffff !important;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

interface TermsData {
    termsOfUse: TermsOfUse | null;
    privacyPolicy: PrivacyPolicy | null;
    legalNotice: LegalNotice | null;
    cancellationPolicy: CancellationPolicy | null;
    acceptanceTerms: AcceptanceTerms | null;
    autoRenewalTerms: AutoRenewalTerms | null;
    error?: string;
}

export default function TermosEPoliticasPage() {
    const router = useRouter();
    const [termsData, setTermsData] = useState<TermsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadTerms = async () => {
            try {
                const result = await getTermsFromAPI();

                if (result.error) {
                    setError(result.error || "Erro ao carregar termos e políticas");
                    return;
                }

                setTermsData(result);
            } catch (err) {
                console.error("Erro ao carregar termos:", err);
                setError("Erro ao carregar termos e políticas");
            } finally {
                setLoading(false);
            }
        };

        loadTerms();
    }, []);

    const handleBack = () => {
        router.back();
    };

    if (loading) {
        return (
            <Container>
                <ContentArea>
                    <LoadingContainer>
                        <Spin size="large" />
                    </LoadingContainer>
                </ContentArea>
            </Container>
        );
    }

    if (error || !termsData) {
        return (
            <Container>
                <ContentArea>
                    <ErrorContainer>
                        <Alert
                            message="Erro"
                            description={error || "Não foi possível carregar os termos e políticas. Tente novamente."}
                            type="error"
                            showIcon
                            style={{ marginBottom: 20 }}
                        />
                        <Button type="primary" onClick={handleBack}>
                            Voltar
                        </Button>
                    </ErrorContainer>
                </ContentArea>
            </Container>
        );
    }

    const sections = [
        {
            id: "termos-de-uso",
            title: "📄 Termos de Uso",
            icon: "📄",
            data: termsData.termsOfUse,
            anchor: "termos-de-uso"
        },
        {
            id: "politica-privacidade",
            title: "🔒 Política de Privacidade",
            icon: "🔒",
            data: termsData.privacyPolicy,
            anchor: "politica-privacidade"
        },
        {
            id: "politica-cancelamento",
            title: "❌ Política de Cancelamento e Reembolso",
            icon: "❌",
            data: termsData.cancellationPolicy,
            anchor: "politica-cancelamento"
        },
        {
            id: "termos-aceite",
            title: "✅ Termos de Aceite",
            icon: "✅",
            data: termsData.acceptanceTerms,
            anchor: "termos-aceite"
        },
        {
            id: "termos-renovacao",
            title: "🔄 Termos de Renovação Automática",
            icon: "🔄",
            data: termsData.autoRenewalTerms,
            anchor: "termos-renovacao"
        },
        {
            id: "aviso-legal",
            title: "⚖️ Aviso Legal",
            icon: "⚖️",
            data: termsData.legalNotice,
            anchor: "aviso-legal"
        },
    ];

    return (
        <Container>
            <MainContent>
                <ContentWrapper>
                    <Sidebar>
                        <SidebarCard>
                            <NavigationTitle level={4}>Navegação</NavigationTitle>
                            <Anchor
                                affix={false}
                                showInkInFixed={true}
                                offsetTop={100}
                            >
                                {sections.map((section) => (
                                    <Link
                                        key={section.id}
                                        href={`#${section.anchor}`}
                                        title={section.title}
                                    />
                                ))}
                            </Anchor>
                        </SidebarCard>
                    </Sidebar>

          <ContentArea>
            <LogoSection>
              <LogoContainer>
                <Image
                  src="/images/passaro.png"
                  alt="Os Donos da Prova"
                  width={60}
                  height={60}
                />
              </LogoContainer>
            </LogoSection>

            <Header>
              <HeaderContent>
                <HeaderTitle level={1}>
                  📋 Termos e Políticas
                </HeaderTitle>

                <HeaderSubtitle>
                  Conheça todos os nossos termos, políticas e condições
                </HeaderSubtitle>
              </HeaderContent>
            </Header>

            <Content>
              {/* Mobile Navigation */}
              <MobileNavigation>
                <MobileNavTitle level={4}>Navegação Rápida</MobileNavTitle>
                <MobileNavLinks>
                  {sections.map((section) => {
                    const simpleTitles = {
                      'termos-de-uso': 'Termos de Uso',
                      'politica-privacidade': 'Privacidade',
                      'aviso-legal': 'Aviso Legal',
                      'politica-cancelamento': 'Cancelamento',
                      'termos-aceite': 'Aceite',
                      'termos-renovacao': 'Renovação'
                    };
                    
                    return (
                      <MobileNavLink
                        key={section.id}
                        href={`#${section.anchor}`}
                      >
                        {section.icon} {simpleTitles[section.id as keyof typeof simpleTitles] || section.title}
                      </MobileNavLink>
                    );
                  })}
                </MobileNavLinks>
              </MobileNavigation>

              {sections.map((section) => {
                if (!section.data) return null;
                
                return (
                  <Section key={section.id} id={section.anchor}>
                    <SectionTitle level={2}>
                      {section.icon} {section.data.title}
                    </SectionTitle>
                    
                    <SectionContent 
                      dangerouslySetInnerHTML={{ __html: section.data.content }} 
                    />
                    
                    <VersionBadge>
                      Versão {section.data.version}
                    </VersionBadge>
                  </Section>
                );
              })}
            </Content>

                        <LastUpdated>
                            Última atualização: {new Date().toLocaleDateString('pt-BR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </LastUpdated>
                    </ContentArea>
                </ContentWrapper>
            </MainContent>
        </Container>
    );
}
