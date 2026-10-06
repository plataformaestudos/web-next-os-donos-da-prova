"use client";
import { useEffect, useState } from "react";
import { Alert, Button, Spin } from "antd";
import { QuoteAmounts, quoteSummary } from "./quote-summary";

export function ReferralQuote({ planId, cycle }: { planId: string; cycle: string }) {
  const [state, setState] = useState<{ loading?: boolean; error?: string; title?: string; amounts?: QuoteAmounts }>({});
  useEffect(() => {
    const controller = new AbortController();
    setState({ loading: true });
    fetch("/api/affiliate-referral/quote", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ planId, cycle }), signal: controller.signal })
      .then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(typeof data.message === "string" ? data.message : "Esta oferta não está disponível para o plano selecionado.");
        if (!controller.signal.aborted) setState(data.active ? { title: data.campaign.title, amounts: { baseAmountCents: data.baseAmountCents, discountAmountCents: data.discountAmountCents, finalAmountCents: data.finalAmountCents } } : {});
      }).catch(error => { if (!controller.signal.aborted) setState({ error: error instanceof Error ? error.message : "Não foi possível consultar a oferta." }); });
    return () => controller.abort();
  }, [planId, cycle]);
  if (state.loading) return <Spin size="small" />;
  if (state.error) return <Alert type="warning" showIcon message={state.error} description="Confira a oferta antes de confirmar a contratação." action={<Button onClick={async () => { const response = await fetch("/api/affiliate-referral/quote", { method: "DELETE" }); if (response.ok) setState({}); }}>Continuar pelo valor regular</Button>} />;
  if (!state.amounts) return null;
  return <Alert type="success" showIcon message={`Oferta ${state.title}`} description={quoteSummary(cycle, state.amounts)} />;
}
