"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { CheckOutlined, ClockCircleOutlined, CloseOutlined, DownloadOutlined, FilePdfOutlined, MailOutlined } from "@ant-design/icons";
import { downloadEbook, ebookAccessStorageKey, ebookAttemptStorageKey, fetchEbookEmailStatus, fetchEbookOrder, recoverEbookAccess, resendEbookEmail } from "./api";
import { EbookBrand, EbookFooter } from "./landing";
import { ebookErrorMessage, formatEbookPrice } from "./format";
import { EbookEmailStatus, EbookOrder, EbookOrderStatus } from "./types";
import styles from "./ebooks.module.css";

const terminalStatuses = new Set(["PAID", "REJECTED", "EXPIRED", "CANCELLED", "REFUNDED", "CHARGEBACK"]);
const failureCopy: Partial<Record<EbookOrderStatus, readonly [string, string]>> = {
  REJECTED: ["Não foi possível iniciar o pagamento", "Nenhuma cobrança foi confirmada para este pedido. Volte à página do ebook e tente novamente."],
  EXPIRED: ["Pagamento expirado", "O prazo desta cobrança terminou. Você pode iniciar uma nova compra na página do ebook."],
  CANCELLED: ["Pagamento cancelado", "Esta cobrança foi cancelada. Se quiser, volte à página do ebook para comprar novamente."],
  REFUNDED: ["Pagamento reembolsado", "Este pedido foi reembolsado e novos downloads não estão disponíveis."],
  CHARGEBACK: ["Pagamento em contestação", "Novos downloads estão indisponíveis enquanto o pagamento estiver em contestação."],
};
const emailCopy: Record<EbookEmailStatus, string> = {
  PENDING: "O envio do link por email está na fila. Você já pode baixar o PDF por aqui.",
  SENDING: "Estamos enviando o link por email. O download já está disponível abaixo.",
  SENT: "O link do material foi enviado para o email informado na compra. Confira também a caixa de spam.",
  FAILED: "Não conseguimos enviar o email agora. Seu download continua disponível e você pode solicitar um reenvio.",
  UNCONFIGURED: "O envio por email está temporariamente indisponível. Você já pode baixar o material por aqui.",
  NOT_REQUIRED: "O download do seu material está disponível abaixo.",
};

export function EbookOrderStatusPage({ orderId }: { orderId: string }) {
  const [token, setToken] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [order, setOrder] = useState<EbookOrder | null>(null);
  const [emailStatus, setEmailStatus] = useState<EbookEmailStatus | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [returnPath, setReturnPath] = useState("");
  const refreshInFlight = useRef(false);
  const actionInFlight = useRef(false);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    // Recovery credentials arrive in a fragment, which is removed before any API request.
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const recovered = fragment.get("accessToken");
    if (window.location.hash) window.history.replaceState(null, "", window.location.pathname + window.location.search);
    let access = recovered;
    try {
      access ||= sessionStorage.getItem(ebookAccessStorageKey(orderId));
      if (recovered) sessionStorage.setItem(ebookAccessStorageKey(orderId), recovered);
      setReturnPath(sessionStorage.getItem(`odp:ebook:return:${orderId}`) || "");
    } catch { if (recovered) setNotice("O acesso está disponível nesta página. Permita o armazenamento da aba para mantê-lo ao recarregar."); }
    setToken(access);
    setInitialized(true);
    return () => { alive.current = false; };
  }, [orderId]);

  const refresh = useCallback(async (queryAsaas = false) => {
    if (!token || refreshInFlight.current) return;
    refreshInFlight.current = true;
    setRefreshing(true);
    try {
      const result = await fetchEbookOrder(orderId, token, queryAsaas);
      if (!alive.current) return;
      setOrder(result);
      setError("");
      if (result.status === "PAID") {
        try { const email = await fetchEbookEmailStatus(orderId, token); if (alive.current) setEmailStatus(email.status); } catch { /* Email cannot block a paid download. */ }
      }
    } catch (cause) { if (alive.current) setError(ebookErrorMessage(cause)); }
    finally { refreshInFlight.current = false; if (alive.current) setRefreshing(false); }
  }, [orderId, token]);

  useEffect(() => { if (token) void refresh(); }, [refresh, token]);
  useEffect(() => {
    const waitingForEmail = order?.status === "PAID" && (emailStatus === "PENDING" || emailStatus === "SENDING");
    if (!token || !order || (terminalStatuses.has(order.status) && !waitingForEmail)) return;
    const interval = window.setInterval(() => { if (document.visibilityState === "visible") void refresh(); }, 10_000);
    const visible = () => { if (document.visibilityState === "visible") void refresh(); };
    document.addEventListener("visibilitychange", visible);
    return () => { window.clearInterval(interval); document.removeEventListener("visibilitychange", visible); };
  }, [token, order, emailStatus, refresh]);

  async function action(name: string, callback: () => Promise<void>) {
    if (actionInFlight.current) return;
    actionInFlight.current = true;
    setBusy(name); setError(""); setNotice("");
    try { await callback(); } catch (cause) { setError(ebookErrorMessage(cause)); } finally { actionInFlight.current = false; setBusy(""); }
  }
  const failed = order ? failureCopy[order.status] : undefined;
  const paid = order?.status === "PAID";
  const reconciling = order?.status === "RECONCILING" || order?.status === "CREATED";
  const heading = paid ? "Seu ebook está pronto!" : failed ? failed[0] : reconciling ? "Estamos verificando o pagamento" : "Aguardando seu pagamento";

  function restartPurchase() {
    if (!order || !returnPath) return;
    try {
      for (let i = sessionStorage.length - 1; i >= 0; i--) {
        const storageKey = sessionStorage.key(i);
        if (storageKey?.startsWith("odp:ebook:order:") && sessionStorage.getItem(storageKey) === orderId) {
          const pageId = storageKey.slice("odp:ebook:order:".length);
          sessionStorage.removeItem(storageKey);
          sessionStorage.removeItem(ebookAttemptStorageKey(pageId));
        }
      }
    } catch { setError("Não foi possível preparar uma nova compra nesta aba."); return; }
    window.location.assign(returnPath);
  }

  return <div className={styles.shell}><header className={styles.header}><div className={styles.headerInner}><EbookBrand /></div></header><main className={styles.flowMain}>
    {!initialized ? <p role="status" className={styles.loading}>Carregando acesso…</p> : !token ? <><div className={styles.statusHeading}><span className={styles.statusIcon}><MailOutlined /></span><h1>Recupere seu ebook</h1><p>Informe o email usado na compra para receber um novo link de acesso, sem senha.</p></div><RecoveryForm onNotice={setNotice} onError={setError} /></> : !order ? <><p role="status" className={styles.loading}>{refreshing ? "Consultando seu pedido…" : "Não foi possível consultar o pedido."}</p><div className={styles.buttonRow}><button type="button" className={styles.secondaryButton} disabled={refreshing} onClick={() => void refresh()}>Tentar novamente</button></div>{error && <RecoveryForm onNotice={setNotice} onError={setError} />}</> : <>
      <div className={styles.statusHeading} aria-live="polite"><span className={styles.statusIcon}>{paid ? <CheckOutlined /> : failed ? <CloseOutlined /> : <ClockCircleOutlined />}</span><h1>{heading}</h1><p>{paid ? "Pagamento confirmado. Agora é hora de estudar." : failed ? failed[1] : reconciling ? "A confirmação pode levar alguns instantes. Acompanhe por aqui; não é necessário pagar novamente." : "Assim que o pagamento for confirmado, seu download será liberado nesta página."}</p></div>
      <section className={styles.flowCard} aria-label="Resumo do pedido"><div className={styles.orderSummary}><span className={styles.summaryIcon}><FilePdfOutlined /></span><div><h2>{order.title}</h2><p>Material digital • PDF</p></div><strong className={styles.summaryPrice}>{formatEbookPrice(order.priceCents)}</strong></div>
        {paid ? <><button type="button" className={`${styles.buy} ${styles.formBuy}`} disabled={!!busy} onClick={() => void action("download", async () => { if (token) await downloadEbook(orderId, token); })}><DownloadOutlined /> {busy === "download" ? "Preparando download…" : "Baixar meu ebook"}</button><p className={styles.statusSmall}>{emailStatus ? emailCopy[emailStatus] : "Você já pode baixar o PDF. O envio do link por email é acompanhado separadamente."}</p><div className={styles.buttonRow}><button type="button" className={styles.secondaryButton} disabled={!!busy} onClick={() => void action("email", async () => { await resendEbookEmail(orderId, token); setEmailStatus("PENDING"); setNotice("Solicitação de reenvio recebida. Você pode continuar baixando o PDF por aqui."); })}>{busy === "email" ? "Solicitando…" : "Reenviar link por email"}</button></div></> : failed ? <>{["REJECTED", "EXPIRED", "CANCELLED"].includes(order.status) && returnPath && <button className={`${styles.buy} ${styles.formBuy}`} onClick={restartPurchase}>Voltar ao ebook</button>}</> : <>
          {order.method === "PIX" && order.pix && order.status === "PENDING" ? <>
            <p className={styles.paymentNote}>Escaneie o QR Code no aplicativo do seu banco ou copie o código abaixo.</p>
            {order.pix.encodedImage && <Image unoptimized width={220} height={220} className={styles.qrCode} src={`data:image/png;base64,${order.pix.encodedImage.replace(/^data:image\/png;base64,/, "")}`} alt="QR Code para pagar este pedido por Pix" />}
            <code className={styles.pixCode}>{order.pix.payload}</code><button type="button" className={`${styles.buy} ${styles.formBuy}`} disabled={!!busy} onClick={() => void action("copy", async () => { await navigator.clipboard.writeText(order.pix?.payload || ""); setNotice("Código Pix copiado."); })}>Copiar código Pix</button>
            {order.pix.expirationDate && <p className={styles.statusSmall}>Válido até {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(order.pix.expirationDate))}</p>}
          </> : <p className={styles.notice}>Estamos acompanhando a confirmação do pagamento. Não feche esta aba até guardar seu acesso.</p>}
          <div className={styles.buttonRow}><button className={styles.secondaryButton} type="button" disabled={refreshing} onClick={() => void refresh(true)}>{refreshing ? "Consultando Asaas…" : "Já paguei / consultar agora"}</button></div>
          <p className={styles.statusSmall}>A página verifica a confirmação automaticamente enquanto estiver aberta.</p>
        </>}
      </section><p className={styles.statusSmall}>Pedido {order.orderId}</p>
    </>}
    {error && <p role="alert" className={`${styles.notice} ${styles.error}`}>{error}</p>}{notice && <p role="status" className={`${styles.notice} ${styles.success}`}>{notice}</p>}
  </main><EbookFooter /></div>;
}

function RecoveryForm({ onNotice, onError }: { onNotice: (message: string) => void; onError: (message: string) => void }) {
  const [busy, setBusy] = useState(false);
  return <form className={`${styles.flowCard} ${styles.recoveryForm}`} onSubmit={async event => {
    event.preventDefault(); if (busy) return; setBusy(true); onError(""); onNotice("");
    const email = String(new FormData(event.currentTarget).get("recoveryEmail") || "").trim();
    try { await recoverEbookAccess(email); onNotice("Se houver uma compra disponível para este email, enviaremos as instruções de acesso. Confira também a caixa de spam."); } catch (cause) { onError(ebookErrorMessage(cause)); } finally { setBusy(false); }
  }}><label className={styles.field}>Email usado na compra<input name="recoveryEmail" type="email" autoComplete="email" required maxLength={254} placeholder="exemplo@email.com" /></label><button type="submit" className={styles.buy} disabled={busy}>{busy ? "Solicitando acesso…" : "Receber link de acesso"}</button></form>;
}
