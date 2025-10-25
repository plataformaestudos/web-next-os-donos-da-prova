"use client";

import React, { useState, useEffect } from "react";
import { Typography, Button, Spin, Alert } from "antd";
import { useRouter } from "next/navigation";
import { getTermsFromAPI } from "@/terms/terms-client.action";
import { PrivacyPolicy } from "@/types/terms.types";
import styled from "styled-components";
import Image from "next/image";

const { Title, Paragraph } = Typography;

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colorPrimaryBg};
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

const ContentWrapper = styled.div`
  width: 100%;
  max-width: 1000px;
  background-color: ${({ theme }) => theme.colorBgContainer};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const Header = styled.div`
  background-color: ${({ theme }) => theme.colorPrimary};
  color: ${({ theme }) => theme.colorSecondary};
  padding: 32px;
  text-align: center;
  position: relative;
`;


const HeaderContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
`;

const LogoContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 16px;
`;

const HeaderTitle = styled(Title)`
  color: ${({ theme }) => theme.colorSecondary} !important;
  margin-bottom: 8px !important;
  font-size: 2rem !important;
  font-weight: 600 !important;
`;

const HeaderSubtitle = styled(Paragraph)`
  color: ${({ theme }) => theme.colorSecondary} !important;
  font-size: 1rem !important;
  margin-bottom: 0 !important;
  opacity: 0.9;
`;

const Content = styled.div`
  padding: 32px;
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
`;

const PrivacyContent = styled.div`
  line-height: 1.8;
  font-size: 16px;
  color: ${({ theme }) => theme.colorText};
  
  h1, h2, h3, h4, h5, h6 {
    color: ${({ theme }) => theme.colorPrimary};
    margin-top: 2rem;
    margin-bottom: 1rem;
  }
  
  p {
    margin-bottom: 1.5rem;
    color: ${({ theme }) => theme.colorText};
  }
  
  ul, ol {
    margin-bottom: 1.5rem;
    padding-left: 2rem;
  }
  
  li {
    margin-bottom: 0.5rem;
    color: ${({ theme }) => theme.colorText};
  }
  
  strong {
    color: ${({ theme }) => theme.colorPrimary};
    font-weight: 600;
  }
  
  a {
    color: ${({ theme }) => theme.colorPrimary};
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const VersionBadge = styled.div`
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  margin-top: 16px;
  color: ${({ theme }) => theme.colorSecondary};
`;

const LastUpdated = styled.div`
  text-align: center;
  padding: 20px;
  background-color: ${({ theme }) => theme.colorPrimaryBg};
  color: ${({ theme }) => theme.colorText};
  font-size: 0.9rem;
  border-top: 1px solid ${({ theme }) => theme.colorPrimaryBg};
`;

export default function PoliticaPrivacidadePage() {
  const router = useRouter();
  const [privacyPolicy, setPrivacyPolicy] = useState<PrivacyPolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTerms = async () => {
      try {
        const result = await getTermsFromAPI();
        
        if (result.error) {
          setError(result.error || "Erro ao carregar política de privacidade");
          return;
        }
        
        if (result.privacyPolicy) {
          setPrivacyPolicy(result.privacyPolicy);
        } else {
          setError("Política de privacidade não encontrada");
        }
      } catch (err) {
        console.error("Erro ao carregar política de privacidade:", err);
        setError("Erro ao carregar política de privacidade");
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
        <ContentWrapper>
          <LoadingContainer>
            <Spin size="large" />
          </LoadingContainer>
        </ContentWrapper>
      </Container>
    );
  }

  if (error || !privacyPolicy) {
    return (
      <Container>
        <ContentWrapper>
          <ErrorContainer>
            <Alert
              message="Erro"
              description={error || "Não foi possível carregar a política de privacidade. Tente novamente."}
              type="error"
              showIcon
              style={{ marginBottom: 20 }}
            />
            <Button type="primary" onClick={handleBack}>
              Voltar
            </Button>
          </ErrorContainer>
        </ContentWrapper>
      </Container>
    );
  }

  return (
    <Container>
      <MainContent>
        <ContentWrapper>
          <Header>          
            <HeaderContent>
              <LogoContainer>
                <Image
                  src="/images/passaro.png"
                  alt="Os Donos da Prova"
                  width={80}
                  height={80}
                />
              </LogoContainer>
              
              <HeaderTitle level={1}>
                🔒 Política de Privacidade
              </HeaderTitle>
              
              <HeaderSubtitle>
                Saiba como protegemos e utilizamos seus dados pessoais
              </HeaderSubtitle>
              
              <VersionBadge>
                Versão {privacyPolicy.version}
              </VersionBadge>
            </HeaderContent>
          </Header>

          <Content>
            <PrivacyContent 
              dangerouslySetInnerHTML={{ __html: privacyPolicy.content }} 
            />
          </Content>

          <LastUpdated>
            Última atualização: {new Date(privacyPolicy.updated_at).toLocaleDateString('pt-BR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </LastUpdated>
        </ContentWrapper>
      </MainContent>
    </Container>
  );
}
