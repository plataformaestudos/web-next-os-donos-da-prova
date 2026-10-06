"use client";

import { useEffect, useState } from "react";
import { CopyOutlined, DownloadOutlined, ExportOutlined } from "@ant-design/icons";
import { Alert, App, Button, Card, Input, QRCode, Skeleton, Table, Tabs, Tag, Typography } from "antd";
import { useQuery } from "@tanstack/react-query";
import { AffiliateCustomer, AffiliateLink, affiliateCustomers, affiliateDashboard, affiliateError } from "./affiliates.api";
import { AffiliateMetrics } from "./overview.component";
import styles from "./link-results.module.css";

const money = (value: number) => (value / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const cycleLabels: Record<string, string> = { MONTHLY: "Mensal", QUARTERLY: "Trimestral", SEMIANNUALLY: "Semestral", YEARLY: "Anual", SEMIANNUAL: "Semestral", ANNUAL: "Anual" };
type LinkResultsProps = { link: AffiliateLink; userId: string; initialTab?: "disclosure" | "results" };

export function LinkResults(props: LinkResultsProps) {
  return <LinkResultsContent key={`${props.userId}-${props.link.id}`} {...props} />;
}

function LinkResultsContent({ link, userId, initialTab = "disclosure" }: LinkResultsProps) {
  const { message } = App.useApp();
  const [page, setPage] = useState(1);
  const [origin, setOrigin] = useState("");
  useEffect(() => { setOrigin(window.location.origin); }, []);
  const url = origin ? `${origin}/r/${encodeURIComponent(link.slug)}` : "";
  const key = ["affiliates-admin", userId, "results", link.id];
  const dashboard = useQuery({ queryKey: [...key, "dashboard"], queryFn: () => affiliateDashboard(link.id) });
  const customers = useQuery({ queryKey: [...key, "customers", page], queryFn: () => affiliateCustomers(link.id, page) });
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      message.success("Link copiado.");
    } catch {
      message.error("Selecione e copie o link acima.");
    }
  };
  const exportQr = () => {
    const canvas = document.getElementById(`campaign-qr-${link.id}`)?.querySelector("canvas");
    if (!canvas) return;
    const anchor = document.createElement("a");
    anchor.href = canvas.toDataURL("image/png");
    anchor.download = `${link.slug}-qr.png`;
    anchor.click();
  };

  return (
    <Tabs defaultActiveKey={initialTab} items={[
      { key: "disclosure", label: "Divulgação", children: (
        <div className={styles.disclosure}>
          {link.status !== "ACTIVE" && <Alert showIcon type="warning" message={link.status === "PAUSED" ? "Campanha pausada. O link está indisponível para novas adesões." : "Campanha arquivada. O link está indisponível para novas adesões."} />}
          <div className={styles.disclosureCards}>
            <Card title="Link de divulgação" className={styles.linkCard}>
              <div className={styles.copyRow}>
                <Input readOnly value={url} aria-label="Link de divulgação" className={styles.linkInput} size="large" />
                <Button icon={<CopyOutlined />} onClick={copyLink} disabled={!url} size="large">Copiar link</Button>
              </div>
              <Typography.Paragraph type="secondary" className={styles.linkDescription}>Compartilhe este link ou QR code para divulgar a campanha.</Typography.Paragraph>
              <Button type="link" icon={<ExportOutlined />} href={url || undefined} disabled={!url} target="_blank" rel="noopener noreferrer" className={styles.openLink}>Abrir link</Button>
            </Card>
            <Card title="QR code">
              <div className={styles.qrContent}>
                <div id={`campaign-qr-${link.id}`} className={styles.qrFrame}>
                  {url ? <QRCode value={url} size={220} type="canvas" color="#163658" bgColor="#ffffff" /> : <Skeleton.Image active style={{ width: 220, height: 220 }} />}
                </div>
                <Button block size="large" icon={<DownloadOutlined />} onClick={exportQr} disabled={!url}>Baixar QR code (PNG)</Button>
              </div>
            </Card>
          </div>
        </div>
      ) },
      { key: "results", label: "Resultados", children: (
        <div className={styles.results}>
          {dashboard.error && <Alert type="error" showIcon message={affiliateError(dashboard.error)} action={<Button onClick={() => dashboard.refetch()}>Tentar novamente</Button>} />}
          <AffiliateMetrics metrics={dashboard.data} loading={dashboard.isFetching} />
          <Card className={styles.customers} title={<div className={styles.customerHeading}><Typography.Title level={4}>Clientes</Typography.Title><Typography.Text type="secondary">Assinaturas e contratações originadas pelo link da campanha.</Typography.Text></div>}>
            {customers.error && <Alert className={styles.customerError} type="error" showIcon message={affiliateError(customers.error)} action={<Button onClick={() => customers.refetch()}>Tentar novamente</Button>} />}
            <Table<AffiliateCustomer>
              rowKey="subscriptionId"
              loading={customers.isFetching}
              dataSource={customers.data?.data}
              scroll={{ x: 1000 }}
              pagination={{ current: page, total: customers.data?.total, pageSize: 20, showSizeChanger: false, onChange: setPage, showTotal: (total, range) => `${range[0]}–${range[1]} de ${total} clientes` }}
              locale={{ emptyText: "Nenhuma contratação atribuída a este link." }}
              columns={[
                { title: "Cliente", width: 220, render: (_, row) => <div className={styles.customerIdentity}><Typography.Text strong={Boolean(row.name)} type={row.name ? undefined : "secondary"}>{row.name || "Conta removida"}</Typography.Text><Typography.Text type="secondary">{row.email || "—"}</Typography.Text></div> },
                { title: "Plano", dataIndex: "planName", width: 160 },
                { title: "Ciclo", dataIndex: "cycle", width: 110, render: (value: string) => cycleLabels[value] || value },
                { title: "Status da assinatura", dataIndex: "status", width: 130, render: (value: string | null) => <Tag color={value === "ACTIVE" ? "success" : value === "INACTIVE" ? "default" : undefined}>{value === "ACTIVE" ? "Ativa" : value === "INACTIVE" ? "Inativa" : "Não informado"}</Tag> },
                { title: "Cobrança por ciclo", dataIndex: "finalAmountCents", width: 150, render: (value: number) => <Typography.Text strong>{money(value)}</Typography.Text> },
                { title: "Contratação", dataIndex: "acceptedAt", width: 130, render: (value: string) => new Date(value).toLocaleDateString("pt-BR") },
                { title: "Primeiro pagamento", dataIndex: "firstPaymentConfirmedAt", width: 170, render: (value: string | null) => value ? new Date(value).toLocaleDateString("pt-BR") : <Typography.Text type="secondary">Aguardando confirmação</Typography.Text> },
              ]}
            />
          </Card>
        </div>
      ) },
    ]} />
  );
}
