"use client";
import { useState } from "react";
import { Alert, App, Button, Card, Col, Input, QRCode, Row, Space, Statistic, Table, Typography } from "antd";
import { useQuery } from "@tanstack/react-query";
import { AffiliateLink, affiliateCustomers, affiliateDashboard, affiliateError } from "./affiliates.api";

const money = (value: number) => (value / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export function LinkResults({ link, userId }: { link: AffiliateLink; userId: string }) {
  const { message } = App.useApp();
  const [page, setPage] = useState(1);
  const url = `${window.location.origin}/r/${encodeURIComponent(link.slug)}`;
  const key = ["affiliates-admin", userId, "results", link.id];
  const dashboard = useQuery({ queryKey: [...key, "dashboard"], queryFn: () => affiliateDashboard(link.id) });
  const customers = useQuery({ queryKey: [...key, "customers", page], queryFn: () => affiliateCustomers(link.id, page) });
  const exportQr = () => {
    const canvas = document.getElementById(`campaign-qr-${link.id}`)?.querySelector("canvas");
    if (!canvas) return;
    const anchor = document.createElement("a");
    anchor.href = canvas.toDataURL("image/png"); anchor.download = `${link.slug}-qr.png`; anchor.click();
  };
  return <Space direction="vertical" size="large" style={{ width: "100%" }}>
    <Card title="Link para divulgação">
      <Space direction="vertical" style={{ width: "100%" }}>
        <Input readOnly value={url} />
        <Space><Button onClick={async () => { try { await navigator.clipboard.writeText(url); message.success("Link copiado."); } catch { message.error("Selecione e copie o link acima."); } }}>Copiar link</Button><Button onClick={exportQr}>Baixar QR code</Button><Button href={url} target="_blank" rel="noopener noreferrer">Abrir link</Button></Space>
        <div id={`campaign-qr-${link.id}`}><QRCode value={url} size={220} type="canvas" /></div>
      </Space>
    </Card>
    {dashboard.error && <Alert type="error" message={affiliateError(dashboard.error)} />}
    <Card loading={dashboard.isFetching} title="Resultados desta campanha">
      {dashboard.data && <><Row gutter={[16, 16]}>
        {[["Visitas", dashboard.data.visits], ["Visitantes", dashboard.data.uniqueVisitors], ["Contratações", dashboard.data.subscriptions], ["Aguardando pagamento", dashboard.data.pendingSubscriptions], ["Conversões pagas", dashboard.data.paidConversions], ["Conversão", `${dashboard.data.conversionRate.toLocaleString("pt-BR")}%`], ["Receita confirmada", money(dashboard.data.grossRevenueCents)], ["Estornos", money(dashboard.data.refundedRevenueCents)], ["Receita líquida", money(dashboard.data.netRevenueCents)]].map(([title, value]) => <Col xs={24} sm={12} md={8} key={title}><Statistic title={title} value={value} /></Col>)}
      </Row><Typography.Paragraph type="secondary" style={{ marginTop: 16 }}>{dashboard.data.financialDefinition}</Typography.Paragraph></>}
    </Card>
    {customers.error && <Alert type="error" message={affiliateError(customers.error)} />}
    <Table rowKey="subscriptionId" loading={customers.isFetching} dataSource={customers.data?.data} scroll={{ x: 900 }} pagination={{ current: page, total: customers.data?.total, pageSize: 20, showSizeChanger: false, onChange: setPage }} locale={{ emptyText: "Nenhuma contratação atribuída a este link." }} columns={[
      { title: "Cliente", render: (_, row) => <><div>{row.name || "Conta removida"}</div><Typography.Text type="secondary">{row.email}</Typography.Text></> },
      { title: "Plano", dataIndex: "planName" }, { title: "Ciclo", dataIndex: "cycle" }, { title: "Status", dataIndex: "status" },
      { title: "Cobrança por ciclo", dataIndex: "finalAmountCents", render: money },
      { title: "Contratação", dataIndex: "acceptedAt", render: value => new Date(value).toLocaleDateString("pt-BR") },
      { title: "Primeiro pagamento", dataIndex: "firstPaymentConfirmedAt", render: value => value ? new Date(value).toLocaleDateString("pt-BR") : "Aguardando" },
    ]} />
  </Space>;
}
