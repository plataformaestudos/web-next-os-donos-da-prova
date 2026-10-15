"use client";

import React, { useState, useEffect } from "react";
import { Checkbox, Typography, Alert, Button } from "antd";
import { useQuery } from "@tanstack/react-query";
import { getTermsFromAPI } from "@/terms/terms-client.action";
import { PaymentConsents } from "./payment-info.style";

const { Text } = Typography;

interface TermsCheckboxProps {
  enabled: boolean;
  onAcceptanceChange: (accepted: boolean) => void;
  onAutoBillingChange: (accepted: boolean) => void;
}

export function TermsCheckbox({ enabled, onAcceptanceChange, onAutoBillingChange }: TermsCheckboxProps) {
  const [acceptedTermsVersion, setAcceptedTermsVersion] = useState<string | null>(null);
  const [acceptedBillingVersion, setAcceptedBillingVersion] = useState<string | null>(null);
  const terms = useQuery({
    queryKey: ["checkout-active-terms"],
    enabled,
    queryFn: async () => {
      const result = await getTermsFromAPI();
      if (result.error || !result.termsOfUse || !result.privacyPolicy) {
        throw new Error(result.error || "Termos de uso indisponíveis.");
      }
      return result;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
  });
  const ready = enabled && terms.isSuccess && !terms.isFetching;
  const data = terms.data;
  const version = data ? JSON.stringify([
    data.termsOfUse, data.privacyPolicy, data.legalNotice,
    data.cancellationPolicy, data.acceptanceTerms, data.autoRenewalTerms,
  ].map(document => [document?.version, document?.updatedAt])) : null;
  const termsAccepted = ready && version !== null && acceptedTermsVersion === version;
  const autoBillingAccepted = ready && version !== null && acceptedBillingVersion === version;

  useEffect(() => {
    onAcceptanceChange(termsAccepted);
  }, [termsAccepted, onAcceptanceChange]);

  useEffect(() => {
    onAutoBillingChange(autoBillingAccepted);
  }, [autoBillingAccepted, onAutoBillingChange]);

  const handleCheckboxChange = (checked: boolean) => {
    setAcceptedTermsVersion(checked ? version : null);
  };

  const handleAutoBillingChange = (checked: boolean) => {
    setAcceptedBillingVersion(checked ? version : null);
  };

  if (terms.isPending || terms.isFetching) {
    return (
      <PaymentConsents role="status">
        <Text type="secondary">Carregando termos de uso...</Text>
      </PaymentConsents>
    );
  }
  if (terms.isError || !data?.termsOfUse || !data.privacyPolicy) {
    return (
      <Alert
        message="Erro"
        description="Não foi possível carregar os termos de uso. Tente novamente."
        type="error"
        showIcon
        action={<Button onClick={() => { void terms.refetch(); }}>Tentar novamente</Button>}
      />
    );
  }

  return (
    <PaymentConsents>
      <Checkbox
        checked={termsAccepted}
        onChange={(e) => handleCheckboxChange(e.target.checked)}
      >
        <Text>
          Li e concordo com os{" "}
          <a href="/termos-e-politicas" target="_blank" rel="noopener noreferrer">
            Termos de Uso, a Política de Privacidade e a Política de Reembolso
          </a>
          {" "} da OS DONOS DA PROVA{" "}
        </Text>
      </Checkbox>
      
      <Checkbox
        checked={autoBillingAccepted}
        onChange={(e) => handleAutoBillingChange(e.target.checked)}
      >
        <Text>
          Concordo com a cobrança automática após o período contratado.
        </Text>
      </Checkbox>
    </PaymentConsents>
  );
}
