"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { Alert, Button, Input, Space, Spin, Typography } from "antd";
import { quoteSummary } from "./quote-summary";
import { ReferralOffer, ReferralReadiness, ReferralRequestError, parseReferralOffer, referralRequestQueue } from "./referral-request-queue";
import styles from "./referral-quote.module.css";

interface ReferralQuoteProps {
  planId: string;
  cycle: string;
  onReadinessChange?: (readiness: ReferralReadiness) => void;
  disabled?: boolean;
}
interface QuoteState {
  selection: string;
  valid: boolean;
  loading: boolean;
  offer?: ReferralOffer;
  error?: string;
}
type Action = "revalidate" | "apply" | "remove";

export function ReferralQuote({ planId, cycle, onReadinessChange, disabled = false }: ReferralQuoteProps) {
  const inputId = useId();
  const errorId = `${inputId}-error`;
  const [code, setCode] = useState("");
  const [state, setState] = useState<QuoteState>({ selection: "", valid: false, loading: true });
  const revision = useRef(0);
  const mounted = useRef(false);
  const pending = useSyncExternalStore(referralRequestQueue.subscribe, referralRequestQueue.getPending, () => 0);
  const selection = `${planId}:${cycle}`;
  const busy = pending > 0 || state.loading || state.selection !== selection;
  const ready = state.selection === selection && state.valid && !busy;
  const offer = state.selection === selection ? state.offer : undefined;

  useEffect(() => {
    onReadinessChange?.({ planId, cycle, ready });
  }, [planId, cycle, ready, onReadinessChange]);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; revision.current += 1; };
  }, []);

  // Every action joins the same queue. Aborting a fetch would not undo Set-Cookie.
  const run = (action: Action) => {
    const version = ++revision.current;
    onReadinessChange?.({ planId, cycle, ready: false });
    setState(previous => ({
      selection,
      loading: true,
      valid: action === "apply" && previous.selection === selection && previous.valid,
      offer: previous.selection === selection ? previous.offer : undefined,
    }));
    const enteredCode = code.trim();
    void referralRequestQueue.enqueue(async () => {
      const response = await fetch(action === "apply" ? "/api/affiliate-referral/code" : "/api/affiliate-referral/quote", {
        method: action === "remove" ? "DELETE" : "POST",
        credentials: "same-origin",
        cache: "no-store",
        ...(action === "remove" ? {} : { headers: { "Content-Type": "application/json" }, body: JSON.stringify({ planId, cycle, ...(action === "apply" ? { code: enteredCode } : {}) }) }),
      });
      const data: unknown = await response.json();
      if (!response.ok) {
        const detail = data && typeof data === "object" && "message" in data ? data.message : undefined;
        throw new ReferralRequestError(typeof detail === "string" ? detail : "Não foi possível aplicar o desconto para este plano e ciclo.", action === "apply");
      }
      const nextOffer = parseReferralOffer(data);
      if (action === "apply" && !nextOffer) throw new Error("Não foi possível aplicar este código de desconto.");
      return nextOffer;
    }).then(nextOffer => {
      if (!mounted.current || revision.current !== version) return;
      setState({ selection, valid: true, loading: false, offer: nextOffer });
      if (action === "remove") setCode("");
      else if (nextOffer?.campaign.slug) setCode(nextOffer.campaign.slug);
    }).catch(error => {
      if (!mounted.current || revision.current !== version) return;
      setState(previous => ({ ...previous, valid: previous.valid && error instanceof ReferralRequestError && error.preservesPreviousOffer, loading: false, error: error instanceof Error ? error.message : "Não foi possível consultar o desconto. Tente novamente." }));
    });
  };
  const runRef = useRef(run);
  runRef.current = run;

  useEffect(() => {
    runRef.current("revalidate");
  }, [planId, cycle]);

  return (
    <section className={styles.discount} aria-label="Código de desconto" aria-busy={busy}>
      <label className={styles.codeLabel} htmlFor={inputId}><Typography.Text strong>Tem um código de desconto?</Typography.Text></label>
      <div className={styles.codeRow}>
        <Input
          id={inputId}
          value={code}
          onChange={event => setCode(event.target.value)}
          onPressEnter={event => { event.preventDefault(); if (code.trim() && !busy && !disabled) run("apply"); }}
          placeholder="Digite seu código"
          autoComplete="off"
          maxLength={100}
          disabled={busy || disabled}
          aria-describedby={state.error ? errorId : undefined}
        />
        <Button onClick={() => run("apply")} disabled={!code.trim() || busy || disabled}>Aplicar</Button>
      </div>
      {busy && <div className={styles.loading} role="status"><Spin size="small" /> <Typography.Text type="secondary">Consultando desconto...</Typography.Text></div>}
      {state.error && state.selection === selection && <Alert
        id={errorId}
        type="warning"
        showIcon
        message={state.error}
        description={state.valid ? offer ? "O desconto anterior foi mantido." : "A contratação permanece pelo valor regular." : "Confira a oferta ou remova o código para continuar pelo valor regular."}
        action={!state.valid ? <Space wrap><Button onClick={() => run("revalidate")} disabled={busy || disabled}>Tentar novamente</Button><Button onClick={() => run("remove")} disabled={busy || disabled}>Continuar pelo valor regular</Button></Space> : undefined}
      />}
      {offer && state.valid && <Alert
        className={styles.offer}
        type="success"
        showIcon
        message={`Oferta ${offer.campaign.title}`}
        description={<>
          <div className={styles.offerSummary}>
            {offer.campaign.slug && <span className={styles.appliedCode}>Código aplicado: <strong>{offer.campaign.slug}</strong></span>}
            <span className={styles.total}>
              Total por ciclo
              <span className={styles.prices}>
                <span className={styles.priceItem}>
                  <span className={styles.visuallyHidden}>Valor original: </span>
                  <del className={styles.originalPrice}>{(offer.baseAmountCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</del>
                </span>
                <span className={styles.priceItem}>
                  <span className={styles.visuallyHidden}>Valor com desconto: </span>
                  <strong>{(offer.finalAmountCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong>
                </span>
              </span>
            </span>
          </div>
          <div className={styles.offerActions}>
            <details className={styles.offerDetails}>
              <summary>Detalhes do desconto</summary>
              <Typography.Paragraph className={styles.summary}>{quoteSummary(cycle, offer)}</Typography.Paragraph>
              <Typography.Text type="secondary">Disponível para contas novas ou Free. A elegibilidade será confirmada na contratação.</Typography.Text>
            </details>
            <Button type="link" size="small" className={styles.removeCode} onClick={() => run("remove")} disabled={busy || disabled}>Remover código</Button>
          </div>
        </>}
      />}
    </section>
  );
}
