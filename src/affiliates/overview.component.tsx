"use client";

import { InfoCircleOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Skeleton, Statistic, Typography, theme } from "antd";
import { useQuery } from "@tanstack/react-query";
import { AffiliateDashboard, affiliateDashboard, affiliatePartnerDashboard, affiliateError } from "./affiliates.api";
import styles from "./overview.module.css";

const money = (cents: number) => (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function AffiliateMetrics({ metrics, loading, showSecondary = true }: { metrics?: AffiliateDashboard; loading: boolean; showSecondary?: boolean }) {
  const { token } = theme.useToken();
  const principalMetrics = [
    { title: "Visitas", value: metrics?.visits },
    { title: "Contratações", value: metrics?.subscriptions },
    { title: "Conversões pagas", value: metrics?.paidConversions },
    { title: "Receita líquida", value: metrics ? money(metrics.netRevenueCents) : undefined },
  ];
  const secondaryMetrics = metrics ? [
    { title: "Visitantes", value: metrics.uniqueVisitors.toLocaleString("pt-BR") },
    { title: "Conversão", value: `${metrics.conversionRate.toLocaleString("pt-BR")}%`, color: token.colorSuccessText },
    { title: "Aguardando pagamento", value: metrics.pendingSubscriptions.toLocaleString("pt-BR"), color: token.colorWarningText },
    { title: "Receita confirmada", value: money(metrics.grossRevenueCents) },
    { title: "Estornos", value: money(metrics.refundedRevenueCents), color: token.colorErrorText },
  ] : [];

  if (!metrics && !loading) return null;

  return (
    <div className={styles.metrics}>
      <div className={styles.principal}>
        {principalMetrics.map(({ title, value }) => (
          <Card key={title} className={styles.metricCard}>
            <div className={styles.metricHeading}>
              <Typography.Text type="secondary" className={styles.metricLabel}>{title}</Typography.Text>
              {/* <Tag className={styles.period}>Todo o período</Tag> */}
            </div>
            {loading && !metrics ? <Skeleton.Input active size="large" /> : (
              <Statistic value={value} groupSeparator="." decimalSeparator="," valueStyle={{ color: token.colorPrimaryText, fontWeight: 700, fontSize: 28 }} />
            )}
          </Card>
        ))}
      </div>
      {metrics && <>
        {showSecondary && <Card size="small">
          <div className={styles.secondary}>
            {secondaryMetrics.map(({ title, value, color }) => (
              <div key={title} className={styles.secondaryItem}>
                <Typography.Text type="secondary">{title}: </Typography.Text>
                <Typography.Text strong style={{ color: color || token.colorPrimaryText }}>{value}</Typography.Text>
              </div>
            ))}
          </div>
        </Card>}
        <Typography.Paragraph type="secondary" className={styles.definition}>
          <InfoCircleOutlined aria-hidden /> {metrics.financialDefinition}
        </Typography.Paragraph>
      </>}
    </div>
  );
}

export function AffiliateOverview({ userId, affiliateId }: { userId: string; affiliateId?: string }) {
  const dashboard = useQuery({
    queryKey: ["affiliates-admin", userId, "overview", affiliateId || "all"],
    queryFn: () => affiliateId ? affiliatePartnerDashboard(affiliateId) : affiliateDashboard(),
  });

  return (
    <section className={styles.overview} aria-label={affiliateId ? "Resultados do afiliado" : "Resultados gerais"}>
      {dashboard.error && <Alert type="error" showIcon message={affiliateError(dashboard.error)} action={<Button onClick={() => dashboard.refetch()}>Tentar novamente</Button>} />}
      <AffiliateMetrics metrics={dashboard.data} loading={dashboard.isFetching} showSecondary={false} />
    </section>
  );
}
