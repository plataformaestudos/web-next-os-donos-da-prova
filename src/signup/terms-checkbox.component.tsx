"use client";

import React, { useState, useEffect } from "react";
import { Checkbox, Typography, Alert, Button } from "antd";
import { useRouter } from "next/navigation";
import { getTermsFromAPI } from "@/terms/terms-client.action";
import { TermsOfUse, PrivacyPolicy } from "@/types/terms.types";

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

  const handleCheckboxChange = (checked: boolean) => {
    setTermsAccepted(checked);
  };

  const handleTermsClick = () => {
    window.open('/termos-de-uso', '_blank');
  };

  const handlePrivacyClick = () => {
    window.open('/politica-privacidade', '_blank');
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
            onClick={handleTermsClick}
            style={{ padding: 0 }}
          >
            termos de uso
          </Button>
          {" "} e a{" "}
          <Button type="link" onClick={handlePrivacyClick} style={{ padding: 0 }}>
            política de privacidade
          </Button>
        </Text>
      </Checkbox>
    </div>
  );
}
