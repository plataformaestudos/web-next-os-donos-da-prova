"use client";

import React, { useState, useEffect } from "react";
import { Checkbox, Typography, Alert, Button } from "antd";
import { getTermsFromAPI } from "@/terms/terms-client.action";
import { TermsOfUse, PrivacyPolicy } from "@/types/terms.types";

const { Text } = Typography;

interface TermsCheckboxProps {
  onAcceptanceChange: (accepted: boolean) => void;
  onAutoBillingChange: (accepted: boolean) => void;
}

export function TermsCheckbox({ onAcceptanceChange, onAutoBillingChange }: TermsCheckboxProps) {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [autoBillingAccepted, setAutoBillingAccepted] = useState(false);
  const [termsOfUse, setTermsOfUse] = useState<TermsOfUse | null>(null);
  const [privacyPolicy, setPrivacyPolicy] = useState<PrivacyPolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTerms = async () => {
      try {
        const result = await getTermsFromAPI();
        
        if (result.error) {
          setError(result.error || "Erro ao carregar termos de uso");
          return;
        }
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

  useEffect(() => {
    onAutoBillingChange(autoBillingAccepted);
  }, [autoBillingAccepted, onAutoBillingChange]);

  const handleCheckboxChange = (checked: boolean) => {
    setTermsAccepted(checked);
  };

  const handleAutoBillingChange = (checked: boolean) => {
    setAutoBillingAccepted(checked);
  };

  const handleTermsClick = () => {
    window.open('/termos-e-politicas', '_blank');
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
    <div style={{ marginTop: "20px" }}>
      <Checkbox
        checked={termsAccepted}
        onChange={(e) => handleCheckboxChange(e.target.checked)}
        style={{ marginBottom: "16px" }}
      >
        <Text>
          Li e concordo com os{" "}
          <Button
            type="link"
            onClick={handleTermsClick}
            style={{ padding: 0 }}
          >
            Termos de Uso, a Política de Privacidade e a Política de Reembolso
          </Button>
          {" "} da OS DONOS DA PROVA{" "}
        </Text>
      </Checkbox>
      
      <Checkbox
        checked={autoBillingAccepted}
        onChange={(e) => handleAutoBillingChange(e.target.checked)}
      >
        <Text>
          Concordo com a cobrança automática após o período gratuito
        </Text>
      </Checkbox>
    </div>
  );
}
