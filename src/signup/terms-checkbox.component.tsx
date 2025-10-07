"use client";

import React, { useState, useEffect } from "react";
import { Checkbox, Modal, Typography, Alert, Button } from "antd";
import { getTermsFromAPI } from "@/terms/terms-client.action";
import { TermsOfUse, PrivacyPolicy } from "@/types/terms.types";
import { 
  TermsModal, 
  ModalHeader, 
  ModalContent, 
  ContentText, 
  ResponsiveWrapper 
} from "./terms-modal.style";

const { Text } = Typography;

interface TermsCheckboxProps {
  onAcceptanceChange: (accepted: boolean) => void;
}

export function TermsCheckbox({ onAcceptanceChange }: TermsCheckboxProps) {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsOfUse, setTermsOfUse] = useState<TermsOfUse | null>(null);
  const [privacyPolicy, setPrivacyPolicy] = useState<PrivacyPolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  useEffect(() => {
    const loadTerms = async () => {
      try {
        const result = await getTermsFromAPI();
        
        if (result.error) {
          setError(result.error || "Erro ao carregar termos de uso");
          return;
        }
        console.log("result", result);
        setTermsOfUse(result.termsOfUse);
        setPrivacyPolicy(result.privacyPolicy);
      } catch (err) {
        console.error("Erro ao carregar termos:", err);
        setError("Erro ao carregar termos de uso");
      } finally {
        setLoading(false);
      }
    };

    loadTerms();
  }, []);

  useEffect(() => {
    onAcceptanceChange(termsAccepted);
  }, [termsAccepted, onAcceptanceChange]);

  const handleCheckboxChange = (checked: boolean) => {
    setTermsAccepted(checked);
  };

  if (loading) {
    return (
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <Text type="secondary">Carregando termos de uso...</Text>
      </div>
    );
  }
  if (error || !termsOfUse || !privacyPolicy) {
    return (
      <Alert
        message="Erro"
        description="Não foi possível carregar os termos de uso. Tente novamente."
        type="error"
        showIcon
      />
    );
  }

  return (
    <div>
      <Checkbox
        checked={termsAccepted}
        onChange={(e) => handleCheckboxChange(e.target.checked)}
      >
        <Text>
          Aceito os{" "}
          <Button
            type="link"
            onClick={() => setShowTermsModal(true)}
            style={{ padding: 0 }}
          >
            termos de uso
          </Button>
          {" "} e a{" "}
          <Button type="link" onClick={() => setShowPrivacyModal(true)} style={{ padding: 0 }}>
            política de privacidade
          </Button>
        </Text>
      </Checkbox>

      {/* Modal dos Termos de Uso */}
      <ResponsiveWrapper>
        <Modal
          title={
            <ModalHeader>
              📄 Termos de Uso - Versão {termsOfUse.version}
            </ModalHeader>
          }
          open={showTermsModal}
          onCancel={() => setShowTermsModal(false)}
          footer={[
            <Button 
              key="close" 
              type="primary"
              onClick={() => setShowTermsModal(false)}
            >
              Fechar
            </Button>,
          ]}
          width="85%"
          style={{ maxWidth: "1200px" }}
          styles={{
            body: {
              padding: "0"
            }
          }}
        >
          <TermsModal>
            <ModalContent>
              <ContentText 
                dangerouslySetInnerHTML={{ __html: termsOfUse.content }} 
              />
            </ModalContent>
          </TermsModal>
        </Modal>
      </ResponsiveWrapper>

      {/* Modal da Política de Privacidade */}
      <ResponsiveWrapper>
        <Modal
          title={
            <ModalHeader>
              🔒 Política de Privacidade - Versão {privacyPolicy.version}
            </ModalHeader>
          }
          open={showPrivacyModal}
          onCancel={() => setShowPrivacyModal(false)}
          footer={[
            <Button 
              key="close" 
              type="primary"
              onClick={() => setShowPrivacyModal(false)}
            >
              Fechar
            </Button>,
          ]}
          width="85%"
          style={{ maxWidth: "1200px" }}
          styles={{
            body: {
              padding: "0"
            }
          }}
        >
          <TermsModal>
            <ModalContent>
              <ContentText 
                dangerouslySetInnerHTML={{ __html: privacyPolicy.content }} 
              />
            </ModalContent>
          </TermsModal>
        </Modal>
      </ResponsiveWrapper>
    </div>
  );
}
