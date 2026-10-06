"use client";
import { Alert, Card, Col, Row, Statistic, Typography } from "antd";
import { useQuery } from "@tanstack/react-query";
import { affiliateDashboard, affiliatePartnerDashboard, affiliateError } from "./affiliates.api";

export function AffiliateOverview({ userId, affiliateId }: { userId: string; affiliateId?: string }) {
  const dashboard = useQuery({ queryKey: ["affiliates-admin", userId, "overview", affiliateId || "all"], queryFn: () => affiliateId ? affiliatePartnerDashboard(affiliateId) : affiliateDashboard() });
  const money = (cents: number) => (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const metrics = dashboard.data;
  return <Card title={affiliateId ? "Resultados do afiliado" : "Resultados gerais"} loading={dashboard.isFetching}>
    {dashboard.error && <Alert type="error" message={affiliateError(dashboard.error)} />}
    {metrics && <><Row gutter={[16, 16]}>
      <Col xs={24} sm={12} md={6}><Statistic title="Visitas" value={metrics.visits} /></Col>
      <Col xs={24} sm={12} md={6}><Statistic title="Contratações" value={metrics.subscriptions} /></Col>
      <Col xs={24} sm={12} md={6}><Statistic title="Conversões pagas" value={metrics.paidConversions} /></Col>
      <Col xs={24} sm={12} md={6}><Statistic title="Receita líquida" value={money(metrics.netRevenueCents)} /></Col>
    </Row><Typography.Paragraph type="secondary" style={{ marginTop: 16 }}>{metrics.financialDefinition}</Typography.Paragraph></>}
  </Card>;
}
