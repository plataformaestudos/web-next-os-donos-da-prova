"use client";

import { CSSProperties, useState } from "react";
import { Alert, App, Button, Card, Dropdown, Modal, Space, Table, Tabs, Tag, Typography, theme } from "antd";
import { EditOutlined, EllipsisOutlined, HistoryOutlined, PauseCircleOutlined, PlayCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import { Roles } from "@/util/roles";
import { FullPageLoading } from "@/ui/loading/full-page-loading";
import {
  Affiliate, AffiliateInput, AffiliateLink, LinkInput, OfferInput,
  affiliateError, listAffiliates, listAffiliateLinks, listAffiliateOffers,
  listAffiliatePlans, publishAffiliateOffer, saveAffiliate, saveAffiliateLink, updateAffiliateLinkStatus,
} from "./affiliates.api";
import { AffiliateDialogForm, AffiliateDialog, OfferValues } from "./affiliate-dialog.component";
import { AffiliateOverview } from "./overview.component";
import { LinkResults } from "./link-results.component";
import styles from "./affiliates.module.css";

const adminRoles = [Roles.ADMIN];
const statusLabels: Record<string, string> = { ACTIVE: "Ativo", INACTIVE: "Inativo", PAUSED: "Pausado", ARCHIVED: "Arquivado" };
const statusColors: Record<string, string> = { ACTIVE: "green", INACTIVE: "gold", PAUSED: "gold", ARCHIVED: "default" };
const sourceLabels = { INFLUENCER: "Influencer", EBOOK: "Ebook", CAMPAIGN: "Campanha própria" };

function StatusBadge({ status }: { status: string }) {
  return <Tag color={statusColors[status]} className={styles.status}>{statusLabels[status] || status}</Tag>;
}

export function Affiliates() {
  const { loading, allowed, user } = useAuthGuard({ requireRoles: adminRoles, redirectOnForbidden: "/home" });
  if (loading) return <FullPageLoading />;
  return allowed && user ? <AffiliatesContent key={user.id} userId={user.id} /> : null;
}

function AffiliatesContent({ userId }: { userId: string }) {
  const { message, modal } = App.useApp();
  const { token } = theme.useToken();
  const pageTheme: CSSProperties & Record<`--affiliate-${string}`, string> = {
    "--affiliate-background": token.colorPrimaryBg,
    "--affiliate-container": token.colorBgContainer,
    "--affiliate-border": token.colorBorderSecondary,
    "--affiliate-primary-text": token.colorPrimaryText,
    "--affiliate-primary": token.colorPrimary,
    "--affiliate-text": token.colorText,
    "--affiliate-secondary-text": token.colorTextSecondary,
    "--affiliate-table-header": token.colorFillAlter,
    "--affiliate-shadow": token.boxShadowTertiary,
  };
  const client = useQueryClient();
  const [affiliatePage, setAffiliatePage] = useState(1);
  const [linkPage, setLinkPage] = useState(1);
  const [dialog, setDialog] = useState<AffiliateDialog | null>(null);
  const [partnerResults, setPartnerResults] = useState<Affiliate | null>(null);
  const [results, setResults] = useState<AffiliateLink | null>(null);
  const [history, setHistory] = useState<AffiliateLink | null>(null);
  const [saving, setSaving] = useState(false);
  const [statusSavingId, setStatusSavingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const baseKey = ["affiliates-admin", userId];
  const affiliates = useQuery({ queryKey: [...baseKey, "affiliates", affiliatePage], queryFn: () => listAffiliates(affiliatePage) });
  const links = useQuery({ queryKey: [...baseKey, "links", linkPage], queryFn: () => listAffiliateLinks(linkPage) });
  const affiliateChoices = useQuery({ queryKey: [...baseKey, "affiliate-choices"], queryFn: () => listAffiliates(1, 100), enabled: dialog?.type === "link" });
  const plans = useQuery({ queryKey: [...baseKey, "plans"], queryFn: listAffiliatePlans, enabled: dialog?.type === "offer" });
  const offers = useQuery({ queryKey: [...baseKey, "offers", history?.id], queryFn: () => history ? listAffiliateOffers(history.id) : Promise.reject(new Error("Selecione uma campanha.")), enabled: Boolean(history) });
  const open = (value: AffiliateDialog) => { setFormError(null); setDialog(value); };
  const save = async (values: AffiliateInput | LinkInput | OfferValues) => {
    if (!dialog) return;
    setSaving(true);
    setFormError(null);
    try {
      if (dialog.type === "affiliate") {
        const data = values as AffiliateInput;
        await saveAffiliate({ ...data, name: data.name.trim(), contact: data.contact?.trim() || null, externalReference: data.externalReference?.trim() || null }, dialog.row?.id);
      } else if (dialog.type === "link") {
        const data = values as LinkInput;
        await saveAffiliateLink({ ...data, title: data.title.trim(), slug: data.slug.trim(), affiliateId: data.affiliateId || null }, dialog.row?.id);
      } else {
        const data = values as OfferValues;
        const input: OfferInput = {
          discountType: data.discountType, discountValue: Math.round(data.amount * 100),
          startsAt: data.startsAt ? new Date(data.startsAt).toISOString() : null,
          endsAt: data.endsAt ? new Date(data.endsAt).toISOString() : null,
          plans: data.selections.map(selection => {
            const [planId, cycle] = selection.split(":");
            return { planId, cycle };
          }),
        };
        await publishAffiliateOffer(dialog.row.id, input);
      }
      message.success(dialog.type === "offer" ? "Nova versão da oferta publicada." : "Cadastro salvo.");
      setDialog(null);
      await client.invalidateQueries({ queryKey: baseKey });
    } catch (error) {
      setFormError(affiliateError(error));
    } finally { setSaving(false); }
  };
  const changeLinkStatus = (row: AffiliateLink) => {
    const nextStatus = row.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
    modal.confirm({
      title: nextStatus === "PAUSED" ? "Pausar campanha?" : "Reativar campanha?",
      content: nextStatus === "PAUSED"
        ? `A campanha “${row.title}” ficará pausada e não aceitará novas adesões. Os descontos de assinaturas já contratadas serão mantidos. Você pode reativá-la depois.`
        : `A campanha “${row.title}” ficará ativa novamente. Novas adesões dependem da vigência da oferta publicada.`,
      okText: nextStatus === "PAUSED" ? "Pausar campanha" : "Reativar campanha",
      cancelText: "Cancelar",
      onOk: async () => {
        setStatusSavingId(row.id);
        try {
          await updateAffiliateLinkStatus(row.id, nextStatus);
          message.success(nextStatus === "PAUSED" ? "Campanha pausada." : "Campanha reativada.");
          await client.invalidateQueries({ queryKey: baseKey });
        } catch (error) {
          message.error(affiliateError(error));
          throw error;
        } finally { setStatusSavingId(null); }
      },
    });
  };

  return (
    <div className={styles.page} style={pageTheme}>
      <header className={styles.header}>
        <Typography.Title level={2}>Afiliados e campanhas</Typography.Title>
        <Typography.Paragraph type="secondary">Gerencie parceiros, links e ofertas.</Typography.Paragraph>
      </header>
      <AffiliateOverview userId={userId} />
      <Card className={styles.workspace}>
        <Tabs defaultActiveKey="links" items={[
          { key: "links", label: "Campanhas", children: <>
            <div className={styles.toolbar}>
              <Typography.Text type="secondary">Links públicos e ofertas de adesão</Typography.Text>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => open({ type: "link" })}>Nova campanha</Button>
            </div>
            {links.error && <Alert className={styles.error} type="error" showIcon message={affiliateError(links.error)} action={<Button onClick={() => links.refetch()}>Tentar novamente</Button>} />}
            <Table<AffiliateLink> className={styles.table} rowKey="id" size="middle" loading={links.isFetching} dataSource={links.data?.data} scroll={{ x: 650 }} locale={{ emptyText: "Nenhuma campanha cadastrada." }} pagination={{ current: linkPage, pageSize: 20, total: links.data?.total, onChange: setLinkPage, showSizeChanger: false, showTotal: (total, range) => `${range[0]}–${range[1]} de ${total}` }} columns={[
              { title: "Campanha", dataIndex: "title", render: (_, row) => <div className={styles.identity}><span className={styles.name}>{row.title}</span><span className={styles.meta}>{row.slug}</span></div> },
              { title: "Origem", dataIndex: "source", width: 170, render: (source: AffiliateLink["source"]) => sourceLabels[source] },
              { title: "Status", dataIndex: "status", width: 120, render: status => <StatusBadge status={status} /> },
              { title: "Ações", align: "right", width: 180, render: (_, row) => <Space size={4}>
                <Button type="text" className={styles.detailsButton} onClick={() => setResults(row)}>Ver detalhes</Button>
                <Dropdown trigger={["click"]} menu={{ items: [
                  { key: "edit", label: "Editar campanha", icon: <EditOutlined />, onClick: () => open({ type: "link", row }) },
                  { key: "offer", label: "Nova oferta", icon: <PlusOutlined />, onClick: () => open({ type: "offer", row }) },
                  { key: "history", label: "Histórico de ofertas", icon: <HistoryOutlined />, onClick: () => setHistory(row) },
                  ...(row.status !== "ARCHIVED" ? [
                    { type: "divider" as const },
                    { key: "status", label: row.status === "ACTIVE" ? "Pausar campanha" : "Reativar campanha", icon: row.status === "ACTIVE" ? <PauseCircleOutlined /> : <PlayCircleOutlined />, onClick: () => changeLinkStatus(row) },
                  ] : []),
                ] }} disabled={statusSavingId === row.id}>
                  <Button aria-label={`Mais ações para ${row.title}`} icon={<EllipsisOutlined />} loading={statusSavingId === row.id} className={styles.moreButton} />
                </Dropdown>
              </Space> },
            ]} />
          </> },
          { key: "affiliates", label: "Afiliados", children: <>
            <div className={styles.toolbar}>
              <Typography.Text type="secondary">Parceiros cadastrados na plataforma</Typography.Text>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => open({ type: "affiliate" })}>Novo afiliado</Button>
            </div>
            {affiliates.error && <Alert className={styles.error} type="error" showIcon message={affiliateError(affiliates.error)} action={<Button onClick={() => affiliates.refetch()}>Tentar novamente</Button>} />}
            <Table<Affiliate> className={styles.table} rowKey="id" size="middle" loading={affiliates.isFetching} dataSource={affiliates.data?.data} scroll={{ x: 650 }} locale={{ emptyText: "Nenhum afiliado cadastrado." }} pagination={{ current: affiliatePage, pageSize: 20, total: affiliates.data?.total, onChange: setAffiliatePage, showSizeChanger: false, showTotal: (total, range) => `${range[0]}–${range[1]} de ${total}` }} columns={[
              { title: "Nome", dataIndex: "name", render: (_, row) => <div className={styles.identity}><span className={styles.name}>{row.name}</span>{row.externalReference && <span className={styles.meta}>{row.externalReference}</span>}</div> },
              { title: "Contato", dataIndex: "contact", render: value => value || "—" },
              { title: "Status", dataIndex: "status", width: 120, render: status => <StatusBadge status={status} /> },
              { title: "Ações", align: "right", width: 175, render: (_, row) => <Space size={4}>
                <Button type="text" className={styles.detailsButton} onClick={() => setPartnerResults(row)}>Resultados</Button>
                <Dropdown trigger={["click"]} menu={{ items: [{ key: "edit", label: "Editar afiliado", icon: <EditOutlined />, onClick: () => open({ type: "affiliate", row }) }] }}>
                  <Button aria-label={`Mais ações para ${row.name}`} icon={<EllipsisOutlined />} className={styles.moreButton} />
                </Dropdown>
              </Space> },
            ]} />
          </> },
        ]} />
      </Card>
      <AffiliateDialogForm dialog={dialog} saving={saving} formError={formError}
        affiliateChoices={affiliateChoices.data?.data || []} affiliateChoicesLoading={affiliateChoices.isFetching} affiliateChoicesError={Boolean(affiliateChoices.error)}
        plans={plans.data || []} plansLoading={plans.isFetching} plansError={Boolean(plans.error)}
        onCancel={() => !saving && setDialog(null)} onSave={save} />
      <Modal open={Boolean(partnerResults)} title={`Resultados — ${partnerResults?.name || ""}`} width={900} footer={<Button onClick={() => setPartnerResults(null)}>Fechar</Button>} onCancel={() => setPartnerResults(null)} destroyOnClose>
        {partnerResults && <AffiliateOverview key={partnerResults.id} userId={userId} affiliateId={partnerResults.id} />}
      </Modal>
      <Modal open={Boolean(results)} title={results?.title || "Detalhes da campanha"} width={1150} footer={<Button onClick={() => setResults(null)}>Fechar</Button>} onCancel={() => setResults(null)} destroyOnClose>
        {results && <LinkResults key={results.id} link={results} userId={userId} />}
      </Modal>
      <Modal open={Boolean(history)} title={`Histórico de ofertas — ${history?.title || ""}`} footer={<Button onClick={() => setHistory(null)}>Fechar</Button>} onCancel={() => setHistory(null)} width={720}>
        <Typography.Paragraph type="secondary">Cada alteração de desconto publica uma nova versão da oferta.</Typography.Paragraph>
        {offers.error && <Alert type="error" showIcon message={affiliateError(offers.error)} />}
        <Table rowKey="id" size="middle" loading={offers.isFetching} dataSource={offers.data} pagination={false} scroll={{ x: 460 }} locale={{ emptyText: "Nenhuma oferta publicada." }} columns={[
          { title: "Versão", dataIndex: "version" },
          { title: "Desconto", render: (_, row) => row.discountType === "PERCENTAGE" ? `${(row.discountValue / 100).toLocaleString("pt-BR")}%` : (row.discountValue / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) },
          { title: "Adesões até", dataIndex: "endsAt", render: value => value ? new Date(value).toLocaleString("pt-BR") : "Sem data final" },
        ]} />
      </Modal>
    </div>
  );
}
