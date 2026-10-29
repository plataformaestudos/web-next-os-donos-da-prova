"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FilePdfOutlined, LockOutlined } from "@ant-design/icons";
import { HttpError } from "@/lib/errors";
import { createEbookOrder, ebookAccessStorageKey, ebookAttemptStorageKey, fetchPublicEbookPage } from "./api";
import { EbookBrand, EbookFooter } from "./landing";
import { EbookPaymentMethod, PublicEbookPage } from "./types";
import { ebookErrorMessage, formatEbookPrice } from "./format";
import styles from "./ebooks.module.css";

export function EbookCheckout({ path }: { path: string }) {
  const router = useRouter();
  const [page, setPage] = useState<PublicEbookPage | null>(null);
  const [method, setMethod] = useState<EbookPaymentMethod>("PIX");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const inFlight = useRef(false);
  const key = useRef("");
  useEffect(() => {
    let active = true;
    if (!path.startsWith("/") || path.startsWith("//")) { setError("Abra o checkout pelo botão da página do ebook."); setLoading(false); return; }
    fetchPublicEbookPage(path).then(result => {
      if (!active) return;
      setPage(result);
      try { key.current = sessionStorage.getItem(ebookAttemptStorageKey(result.id)) || ""; } catch { /* A compra exige persistir o acesso antes de cobrar. */ }
    }).catch(() => { if (active) setError("Este ebook não está disponível para compra agora."); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [path]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!page || inFlight.current) return;
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    inFlight.current = true;
    setBusy(true);
    setError("");
    const data = new FormData(form);
    const text = (name: string) => String(data.get(name) || "").trim();
    try {
      key.current ||= crypto.randomUUID();
      // Only an opaque attempt ID is stored. Buyer and card fields never enter browser storage.
      sessionStorage.setItem(ebookAttemptStorageKey(page.id), key.current);
      const result = await createEbookOrder({
        pageId: page.id,
        expectedEbookId: page.ebook.id,
        expectedPriceCents: page.ebook.priceCents,
        idempotencyKey: key.current,
        method,
        buyer: { name: text("name"), email: text("email"), cpfCnpj: text("cpfCnpj"), ...(text("phone") ? { phone: text("phone") } : {}), ...(method === "CREDIT_CARD" ? { postalCode: text("postalCode"), addressNumber: text("addressNumber") } : {}) },
        ...(method === "CREDIT_CARD" ? { creditCard: { holderName: text("holderName"), number: text("number").replace(/\s/g, ""), expiryMonth: text("expiryMonth"), expiryYear: text("expiryYear"), ccv: text("ccv") } } : {}),
      });
      sessionStorage.setItem(ebookAccessStorageKey(result.orderId), result.accessToken);
      sessionStorage.setItem(`odp:ebook:return:${result.orderId}`, page.path);
      // The server order is authoritative; revisiting checkout must continue this order.
      sessionStorage.setItem(ebookAttemptStorageKey(page.id), key.current);
      sessionStorage.setItem(`odp:ebook:order:${page.id}`, result.orderId);
      form.reset();
      router.replace(`/ebooks/pedido/${encodeURIComponent(result.orderId)}`);
    } catch (cause) {
      if (cause instanceof HttpError && cause.status === 409) {
        try { setPage(await fetchPublicEbookPage(path)); } catch { /* Keep the attempted purchase visible if refresh is unavailable. */ }
      }
      setError(cause instanceof DOMException ? "Permita o armazenamento desta aba para manter o acesso à compra e tente novamente." : `${ebookErrorMessage(cause)} Sua tentativa será mantida ao tentar novamente, sem criar outra cobrança.`);
    } finally { inFlight.current = false; setBusy(false); }
  }

  useEffect(() => {
    if (!page) return;
    try {
      const orderId = sessionStorage.getItem(`odp:ebook:order:${page.id}`);
      if (orderId && sessionStorage.getItem(ebookAccessStorageKey(orderId))) router.replace(`/ebooks/pedido/${encodeURIComponent(orderId)}`);
    } catch { /* Submit provides actionable storage feedback before charging. */ }
  }, [page, router]);

  return <div className={styles.shell}><header className={styles.header}><div className={styles.headerInner}><EbookBrand /><span className={styles.paymentNote} style={{ color: "white", margin: 0 }}><LockOutlined /> Compra segura</span></div></header><main className={styles.flowMain}>
    {loading ? <p role="status" className={styles.loading}>Carregando ebook…</p> : <>
      {page && <a className={styles.backLink} href={page.path}>← Voltar ao ebook</a>}
      <h1>Seu próximo passo começa aqui</h1><p className={styles.flowIntro}>Compre seu ebook sem criar conta e sem senha.</p>
      {error && <p role="alert" className={`${styles.notice} ${styles.error}`}>{error}</p>}
      {page && <form className={styles.flowCard} onSubmit={submit}>
        <div className={styles.orderSummary}><span className={styles.summaryIcon}><FilePdfOutlined /></span><div><h2>{page.ebook.title}</h2><p>Arquivo digital em PDF</p></div><strong className={styles.summaryPrice}>{formatEbookPrice(page.ebook.priceCents)}</strong></div>
        <h2 className={styles.formHeading}>1. Dados para envio do material</h2>
        <label className={styles.field}>Nome completo<input name="name" autoComplete="name" required minLength={2} maxLength={150} placeholder="Seu nome completo" /></label>
        <label className={styles.field}>Email<input name="email" autoComplete="email" type="email" required maxLength={254} placeholder="exemplo@email.com" /><small>O link do ebook será enviado para este email após a confirmação.</small></label>
        <div className={styles.fieldGrid}><label className={styles.field}>CPF ou CNPJ<input name="cpfCnpj" inputMode="numeric" required minLength={11} maxLength={18} placeholder="000.000.000-00" /></label><label className={styles.field}>Telefone{method === "PIX" ? " (opcional)" : ""}<input name="phone" type="tel" autoComplete="tel" required={method === "CREDIT_CARD"} minLength={10} maxLength={20} placeholder="(00) 00000-0000" /></label></div>
        <fieldset className={styles.paymentMethods}><legend>2. Forma de pagamento</legend><label className={styles.method}><input type="radio" name="method" value="PIX" checked={method === "PIX"} onChange={() => setMethod("PIX")} />Pix</label><label className={styles.method}><input type="radio" name="method" value="CREDIT_CARD" checked={method === "CREDIT_CARD"} onChange={() => setMethod("CREDIT_CARD")} />Cartão à vista</label></fieldset>
        {method === "PIX" ? <p className={styles.paymentNote}>Geraremos um QR Code e um código Pix copia e cola. O download será liberado após a confirmação do pagamento.</p> : <>
          <label className={styles.field}>Nome impresso no cartão<input name="holderName" autoComplete="cc-name" required maxLength={100} placeholder="Como consta no cartão" /><small>Use um cartão do titular informado nos dados da compra.</small></label>
          <label className={styles.field}>Número do cartão<input name="number" autoComplete="cc-number" inputMode="numeric" required pattern="[0-9 ]{13,23}" maxLength={23} placeholder="0000 0000 0000 0000" /></label>
          <div className={styles.fieldGrid}><label className={styles.field}>Mês de validade<input name="expiryMonth" autoComplete="cc-exp-month" inputMode="numeric" pattern="0[1-9]|1[0-2]" required maxLength={2} placeholder="MM" /></label><label className={styles.field}>Ano de validade<input name="expiryYear" autoComplete="cc-exp-year" inputMode="numeric" pattern="20[0-9]{2}" required maxLength={4} placeholder="AAAA" /></label></div>
          <div className={styles.fieldGrid}><label className={styles.field}>Código de segurança<input name="ccv" autoComplete="cc-csc" type="password" inputMode="numeric" pattern="[0-9]{3,4}" required maxLength={4} placeholder="CVV" /></label><label className={styles.field}>CEP de cobrança<input name="postalCode" autoComplete="billing postal-code" inputMode="numeric" pattern="[0-9]{5}-?[0-9]{3}" required maxLength={9} placeholder="00000-000" /></label></div>
          <label className={styles.field}>Número do endereço de cobrança<input name="addressNumber" autoComplete="billing address-line2" required maxLength={20} placeholder="Número ou s/n" /></label>
          <p className={styles.paymentNote}>Pagamento único no cartão, sem parcelamento. O arquivo estará disponível após a confirmação.</p>
        </>}
        <label className={styles.terms}><input name="terms" type="checkbox" required /><span>Li e aceito os <a href="/termos-de-uso" target="_blank" rel="noreferrer">Termos de Uso</a> e a <a href="/politica-privacidade" target="_blank" rel="noreferrer">Política de Privacidade</a>.</span></label>
        <button className={`${styles.buy} ${styles.formBuy}`} disabled={busy} type="submit">{busy ? "Processando sua compra…" : method === "PIX" ? `Gerar Pix de ${formatEbookPrice(page.ebook.priceCents)}` : `Pagar ${formatEbookPrice(page.ebook.priceCents)} à vista`}</button>
        <p className={styles.statusSmall}><LockOutlined /> Pagamento processado pelo Asaas. Nenhuma assinatura será criada.</p>
      </form>}
    </>}
  </main><EbookFooter /></div>;
}
