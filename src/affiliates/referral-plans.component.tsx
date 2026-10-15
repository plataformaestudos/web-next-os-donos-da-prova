"use client";

import { Alert, Button, Input, Space, Spin, Typography } from "antd";
import { createContext, ReactNode, useCallback, useContext, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { parseReferralPreview, previewPrice, ReferralPreview } from "./referral-preview";
import { referralRequestQueue, ReferralRequestError, ReferralOffer } from "./referral-request-queue";
import { NewPlanModel } from "@/model/plan.model";
import { getPlanCardPrice } from "@/plans/plan-price-display";
import styles from "./referral-quote.module.css";

interface PreviewState {
  loading: boolean;
  valid: boolean;
  preview?: ReferralPreview;
  error?: string;
  revision: number;
}
type Action = "load" | "apply" | "remove";
interface PreviewContext extends PreviewState {
  run: (action: Action, code?: string) => void;
  reconcileQuote: (planId: string, cycle: string, offer: ReferralOffer | undefined, excluded: boolean) => void;
}
const ReferralPlansContext = createContext<PreviewContext | null>(null);

export const useReferralPlans = () => useContext(ReferralPlansContext);

export function ReferralPlansProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PreviewState>({ loading: true, valid: false, revision: 0 });
  const mounted = useRef(false);
  const version = useRef(0);
  const stateRef = useRef(state);
  stateRef.current = state;
  const run = useCallback((action: Action, code?: string) => {
    const current = ++version.current;
    setState(previous => ({ ...previous, loading: true, error: undefined }));
    void referralRequestQueue.enqueue(async () => {
      const response = await fetch(action === "apply" ? "/api/affiliate-referral/apply-code" : action === "remove" ? "/api/affiliate-referral/quote" : "/api/affiliate-referral/preview", {
        method: action === "remove" ? "DELETE" : "POST", credentials: "same-origin", cache: "no-store",
        ...(action === "remove" ? {} : { headers: { "Content-Type": "application/json" }, body: JSON.stringify(action === "apply" ? { code } : {}) }),
      });
      const data: unknown = await response.json();
      if (!response.ok) {
        const message = data && typeof data === "object" && "message" in data && typeof data.message === "string" ? data.message : "Não foi possível consultar a campanha. Tente novamente.";
        throw new ReferralRequestError(message, action === "apply");
      }
      const preview = parseReferralPreview(data);
      if (action === "apply" && !preview) throw new Error("Não foi possível aplicar este código.");
      return preview;
    }).then(preview => {
      if (!mounted.current || current !== version.current) return;
      setState(previous => ({ loading: false, valid: true, preview, revision: previous.revision + 1 }));
    }).catch(error => {
      if (!mounted.current || current !== version.current) return;
      setState(previous => {
        const preserved = previous.valid && error instanceof ReferralRequestError && error.preservesPreviousOffer;
        return { ...previous, loading: false, valid: preserved, preview: preserved ? previous.preview : undefined,
          revision: previous.revision + (preserved ? 0 : 1), error: error instanceof Error ? error.message : "Não foi possível consultar a campanha. Tente novamente." };
      });
    });
  }, []);

  const reconcileQuote = useCallback((planId: string, cycle: string, offer: ReferralOffer | undefined, excluded: boolean) => {
    const current = stateRef.current.preview;
    if (offer && (!current || current.campaign.slug !== offer.campaign.slug)) {
      run("load");
      return;
    }
    setState(previous => {
      const preview = previous.preview;
      if (!preview) return previous;
      if (!offer && !excluded) return { ...previous, preview: undefined };
      const existing = preview.prices.find(item => item.planId === planId && item.cycle === cycle);
      if (offer && existing?.available && existing.baseAmountCents === offer.baseAmountCents
        && existing.discountAmountCents === offer.discountAmountCents && existing.finalAmountCents === offer.finalAmountCents) return previous;
      if (excluded && !existing) return previous;
      const prices = preview.prices.filter(item => item.planId !== planId || item.cycle !== cycle);
      if (offer) prices.push({ planId, cycle, available: true, baseAmountCents: offer.baseAmountCents,
        discountAmountCents: offer.discountAmountCents, finalAmountCents: offer.finalAmountCents });
      // The selected quote is authoritative. Updating its display must not trigger another quote.
      return { ...previous, preview: { ...preview, prices } };
    });
  }, [run]);

  useEffect(() => {
    mounted.current = true;
    run("load");
    return () => { mounted.current = false; version.current += 1; };
  }, [run]);

  useEffect(() => {
    if (!state.preview || !state.valid || state.loading) return;
    const timer = window.setTimeout(() => run("load"), Math.max(0, Date.parse(state.preview.expiresAt) - Date.now()));
    return () => window.clearTimeout(timer);
  }, [state.preview, state.valid, state.loading, run]);

  return <ReferralPlansContext.Provider value={{ ...state, run, reconcileQuote }}>{children}</ReferralPlansContext.Provider>;
}

export function ReferralPlanCode({ disabled = false }: { disabled?: boolean }) {
  const context = useReferralPlans();
  const id = useId();
  const [code, setCode] = useState("");
  const pending = useSyncExternalStore(referralRequestQueue.subscribe, referralRequestQueue.getPending, () => 0);
  const slug = context?.preview?.campaign.slug;
  useEffect(() => { setCode(slug ?? ""); }, [slug, context?.revision]);
  if (!context) return null;
  const { loading, valid, preview, error, run } = context;
  const busy = loading || pending > 0;
  return <section className={styles.discount} aria-label="Código de desconto" aria-busy={busy} style={{ marginBottom: 24 }}>
    <label className={styles.codeLabel} htmlFor={id}><Typography.Text strong>Tem um código de desconto?</Typography.Text></label>
    <div className={styles.codeRow}>
      <Input id={id} value={code} onChange={event => setCode(event.target.value)}
        onPressEnter={event => { event.preventDefault(); if (code.trim() && !busy && !disabled) run("apply", code.trim()); }}
        placeholder="Digite seu código" autoComplete="off" maxLength={100} disabled={busy || disabled} aria-describedby={error ? `${id}-error` : undefined} />
      <Button onClick={() => run("apply", code.trim())} disabled={!code.trim() || busy || disabled}>Aplicar</Button>
    </div>
    {busy && <div className={styles.loading} role="status"><Spin size="small" /> <Typography.Text type="secondary">Consultando preços da campanha...</Typography.Text></div>}
    {error && <Alert id={`${id}-error`} type="warning" showIcon message={error}
      description={valid ? preview ? "A campanha anterior foi mantida." : "Os planos permanecem pelo valor regular." : "Tente novamente ou remova o código para continuar pelo valor regular."}
      action={!valid ? <Space wrap><Button onClick={() => run("load")} disabled={busy || disabled}>Tentar novamente</Button><Button onClick={() => run("remove")} disabled={busy || disabled}>Continuar pelo valor regular</Button></Space> : undefined} />}
    {preview && valid && <Alert className={styles.offer} type="success" showIcon message={`Oferta ${preview.campaign.title}`}
      description={<div className={styles.offerSummary}><span className={styles.appliedCode}><strong>Código aplicado!</strong> Confira os preços de cada plano e ciclo abaixo. A elegibilidade será confirmada na contratação.</span>
        <Button type="link" size="small" className={styles.removeCode} onClick={() => run("remove")} disabled={busy || disabled}>Remover código</Button></div>} />}
  </section>;
}

export function ReferralPlanPrice({ plan }: { plan: NewPlanModel }) {
  const context = useReferralPlans();
  const regular = getPlanCardPrice(plan);
  const preview = context?.valid ? context.preview : undefined;
  const price = regular ? previewPrice(preview, plan.id, regular.cycle) : undefined;
  const original = price ? getPlanCardPrice(plan, price.baseAmountCents) : regular;
  const discounted = price ? getPlanCardPrice(plan, price.finalAmountCents) : null;
  if (plan.isFree) return <><strong>Gratuito</strong><span>Sem cobrança</span></>;
  return <>
    {price && discounted ? <>
      <del aria-label={`Valor original: ${original?.headline}`}>{original?.headline}</del>
      <strong aria-label={`Valor com desconto: ${discounted.headline}`}>{discounted.headline}</strong>
      <span>{discounted.detail}</span>
      <span className={styles.savings}>Economize {(price.discountAmountCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} por ciclo</span>
    </> : <><strong>{regular?.headline}</strong><span>{regular?.detail}</span></>}
    {preview && regular && !price && <span>{preview.prices.some(item => item.planId === plan.id && item.cycle === regular.cycle) ? "Desconto indisponível neste ciclo." : "Este plano e ciclo não participam da campanha. Valor regular."}</span>}
    {context?.loading && <span role="status">Consultando desconto...</span>}
    {context?.error && !context.valid && <span>Preço regular. Campanha pendente de validação.</span>}
  </>;
}
