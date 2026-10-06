"use client";

import { useState } from "react";
import { Alert, App, Button, Card, Form, Input, InputNumber, Modal, Select, Space, Table, Tabs, Tag, Typography } from "antd";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import { Roles } from "@/util/roles";
import { FullPageLoading } from "@/ui/loading/full-page-loading";
import {
  Affiliate, AffiliateInput, AffiliateLink, LinkInput, OfferInput,
  affiliateError, listAffiliates, listAffiliateLinks, listAffiliateOffers,
  listAffiliatePlans, publishAffiliateOffer, saveAffiliate, saveAffiliateLink,
} from "./affiliates.api";

import { AffiliateOverview } from "./overview.component";
import { LinkResults } from "./link-results.component";

const adminRoles = [Roles.ADMIN];
const statusLabels: Record<string, string> = { ACTIVE: "Ativo", INACTIVE: "Inativo", PAUSED: "Pausado", ARCHIVED: "Arquivado", DRAFT: "Rascunho" };
const sourceLabels = { INFLUENCER: "Influencer", EBOOK: "Ebook", CAMPAIGN: "Campanha própria" };
type Dialog = { type: "affiliate"; row?: Affiliate } | { type: "link"; row?: AffiliateLink } | { type: "offer"; row: AffiliateLink };
type OfferValues = { discountType: "FIXED" | "PERCENTAGE"; amount: number; startsAt?: string; endsAt?: string; planIds: string[]; selections: string[] };

export function Affiliates() {
  const { loading, allowed, user } = useAuthGuard({ requireRoles: adminRoles, redirectOnForbidden: "/home" });
  if (loading) return <FullPageLoading />;
  return allowed && user ? <AffiliatesContent key={user.id} userId={user.id} /> : null;
}

function AffiliatesContent({ userId }: { userId: string }) {
  const { message } = App.useApp();
  const client = useQueryClient();
  const [affiliatePage, setAffiliatePage] = useState(1);
  const [linkPage, setLinkPage] = useState(1);
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const [partnerResults, setPartnerResults] = useState<Affiliate | null>(null);
  const [results, setResults] = useState<AffiliateLink | null>(null);
  const [history, setHistory] = useState<AffiliateLink | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const baseKey = ["affiliates-admin", userId];
  const affiliates = useQuery({ queryKey: [...baseKey, "affiliates", affiliatePage], queryFn: () => listAffiliates(affiliatePage) });
  const links = useQuery({ queryKey: [...baseKey, "links", linkPage], queryFn: () => listAffiliateLinks(linkPage) });
  const affiliateChoices = useQuery({ queryKey: [...baseKey, "affiliate-choices"], queryFn: () => listAffiliates(1, 100), enabled: dialog?.type === "link" });
  const plans = useQuery({ queryKey: [...baseKey, "plans"], queryFn: listAffiliatePlans, enabled: dialog?.type === "offer" });
  const offers = useQuery({ queryKey: [...baseKey, "offers", history?.id], queryFn: () => history ? listAffiliateOffers(history.id) : Promise.reject(new Error("Selecione uma campanha.")), enabled: Boolean(history) });
  const open = (value: Dialog) => { setFormError(null); setDialog(value); };
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
  return (
    <Space direction="vertical" size="large" style={{ width: "100%", padding: 24 }}>
      <Typography.Title level={2}>Afiliados e campanhas</Typography.Title>
      <Alert type="info" showIcon message="Cadastre parceiros e organize suas ofertas" description="Alterações de desconto criam uma nova versão da oferta. Esta área é exclusiva dos administradores." />
      <AffiliateOverview userId={userId} />
      <Tabs items={[
        { key: "affiliates", label: "Afiliados", children: <Card extra={<Button type="primary" onClick={() => open({ type: "affiliate" })}>Novo afiliado</Button>}>
          {affiliates.error && <Alert type="error" message={affiliateError(affiliates.error)} action={<Button onClick={() => affiliates.refetch()}>Tentar novamente</Button>} />}
          <Table<Affiliate> rowKey="id" loading={affiliates.isFetching} dataSource={affiliates.data?.data} scroll={{ x: 650 }} locale={{ emptyText: "Nenhum afiliado cadastrado." }} pagination={{ current: affiliatePage, pageSize: 20, total: affiliates.data?.total, onChange: setAffiliatePage, showSizeChanger: false }} columns={[
            { title: "Nome", dataIndex: "name" }, { title: "Referência", dataIndex: "externalReference" }, { title: "Contato", dataIndex: "contact" },
            { title: "Status", dataIndex: "status", render: status => <Tag>{statusLabels[status] || status}</Tag> },
            { title: "Ações", render: (_, row) => <Space><Button onClick={() => setPartnerResults(row)}>Resultados</Button><Button onClick={() => open({ type: "affiliate", row })}>Editar</Button></Space> },
          ]} />
        </Card> },
        { key: "links", label: "Links e campanhas", children: <Card extra={<Button type="primary" onClick={() => open({ type: "link" })}>Novo link</Button>}>
          {links.error && <Alert type="error" message={affiliateError(links.error)} action={<Button onClick={() => links.refetch()}>Tentar novamente</Button>} />}
          <Table<AffiliateLink> rowKey="id" loading={links.isFetching} dataSource={links.data?.data} scroll={{ x: 800 }} locale={{ emptyText: "Nenhum link cadastrado." }} pagination={{ current: linkPage, pageSize: 20, total: links.data?.total, onChange: setLinkPage, showSizeChanger: false }} columns={[
            { title: "Campanha", dataIndex: "title" }, { title: "Identificador", dataIndex: "slug" },
            { title: "Origem", dataIndex: "source", render: (source: AffiliateLink["source"]) => sourceLabels[source] },
            { title: "Status", dataIndex: "status", render: status => <Tag>{statusLabels[status] || status}</Tag> },
            { title: "Ações", render: (_, row) => <Space wrap><Button onClick={() => setResults(row)}>Resultados / QR</Button><Button onClick={() => open({ type: "link", row })}>Editar</Button><Button onClick={() => open({ type: "offer", row })}>Nova oferta</Button><Button onClick={() => setHistory(row)}>Versões</Button></Space> },
          ]} />
        </Card> },
      ]} />
      {dialog && <Modal open title={dialog.type === "offer" ? `Nova oferta — ${dialog.row.title}` : dialog.type === "affiliate" ? "Afiliado" : "Link / campanha"} footer={null} onCancel={() => !saving && setDialog(null)} maskClosable={!saving} closable={!saving}>
        <Form key={`${dialog.type}-${dialog.row?.id || "new"}`} layout="vertical" initialValues={dialog.type === "offer" ? { discountType: "PERCENTAGE" } : { status: "ACTIVE", source: "CAMPAIGN", ...dialog.row }} onFinish={save}>
          {formError && <Alert type="error" message={formError} style={{ marginBottom: 16 }} />}
          {dialog.type === "affiliate" ? <>
            <Form.Item name="name" label="Nome" rules={[{ required: true, whitespace: true }]}><Input maxLength={150} /></Form.Item>
            <Form.Item name="externalReference" label="Referência externa"><Input maxLength={200} /></Form.Item>
            <Form.Item name="contact" label="Contato"><Input maxLength={250} /></Form.Item>
          </> : dialog.type === "link" ? <>
            <Form.Item name="title" label="Título" rules={[{ required: true, whitespace: true }]}><Input maxLength={200} /></Form.Item>
            <Form.Item name="slug" label="Identificador público" rules={[{ required: true }, { pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, message: "Use letras minúsculas, números e hífens." }]}><Input maxLength={100} disabled={Boolean(dialog.row)} /></Form.Item>
            <Form.Item name="source" label="Origem" rules={[{ required: true }]}><Select disabled={Boolean(dialog.row)} options={Object.entries(sourceLabels).map(([value, label]) => ({ value, label }))} /></Form.Item>
            <Form.Item name="affiliateId" label="Afiliado (opcional)"><Select disabled={Boolean(dialog.row)} allowClear showSearch optionFilterProp="label" loading={affiliateChoices.isFetching} options={affiliateChoices.data?.data.map(row => ({ value: row.id, label: row.name }))} /></Form.Item>
            {affiliateChoices.error && <Alert type="error" message="Não foi possível carregar os afiliados." />}
          </> : <>
            <Typography.Paragraph>O desconto é permanente para a assinatura contratada. As datas limitam somente novas adesões.</Typography.Paragraph>
            <Form.Item name="discountType" label="Tipo de desconto" rules={[{ required: true }]}><Select options={[{ value: "PERCENTAGE", label: "Porcentagem (%)" }, { value: "FIXED", label: "Valor em reais (R$)" }]} /></Form.Item>
            <Form.Item noStyle shouldUpdate={(prev, next) => prev.discountType !== next.discountType}>{({ getFieldValue }) => <Form.Item name="amount" label={getFieldValue("discountType") === "FIXED" ? "Desconto (R$)" : "Desconto (%)"} rules={[{ required: true }]}><InputNumber min={0.01} precision={2} style={{ width: "100%" }} /></Form.Item>}</Form.Item>
            <Form.Item name="planIds" label="Planos" rules={[{ required: true, type: "array", min: 1 }]}><Select mode="multiple" loading={plans.isFetching} options={plans.data?.map(plan => ({ value: plan.id, label: plan.name }))} /></Form.Item>
            {plans.error && <Alert type="error" message="Não foi possível carregar os planos." />}
            <Form.Item noStyle shouldUpdate={(prev, next) => prev.planIds !== next.planIds}>{({ getFieldValue }) => {
              const selectedIds: string[] = getFieldValue("planIds") || [];
              const options = (plans.data || []).filter(plan => selectedIds.includes(plan.id)).flatMap(plan => plan.cycles.map(({ cycle }) => ({ value: `${plan.id}:${cycle}`, label: `${plan.name} — ${cycle}` })));
              return <Form.Item name="selections" label="Ciclos por plano" dependencies={["planIds"]} rules={[
                { required: true, type: "array", min: 1 },
                { validator: (_, values: string[] | undefined) => !values?.length || values.every(value => options.some(option => option.value === value)) ? Promise.resolve() : Promise.reject(new Error("Selecione novamente os ciclos dos planos atuais.")) },
                { validator: (_, values: string[] | undefined) => selectedIds.every(id => values?.some(value => value.startsWith(`${id}:`))) ? Promise.resolve() : Promise.reject(new Error("Selecione ao menos um ciclo para cada plano.")) },
              ]}><Select mode="multiple" options={options} disabled={!selectedIds.length} /></Form.Item>;
            }}</Form.Item>
            <Form.Item name="startsAt" label="Início das adesões (horário local)"><Input type="datetime-local" /></Form.Item>
            <Form.Item name="endsAt" label="Fim das adesões (horário local)" dependencies={["startsAt"]} rules={[({ getFieldValue }) => ({ validator: (_, value) => !value || !getFieldValue("startsAt") || new Date(value) > new Date(getFieldValue("startsAt")) ? Promise.resolve() : Promise.reject(new Error("O fim deve ser posterior ao início.")) })]}><Input type="datetime-local" /></Form.Item>
          </>}
          {dialog.type !== "offer" && dialog.row && <Form.Item name="status" label="Status" rules={[{ required: true }]}><Select options={(dialog.type === "affiliate" ? ["ACTIVE", "INACTIVE", "ARCHIVED"] : ["ACTIVE", "PAUSED", "ARCHIVED"]).map(value => ({ value, label: statusLabels[value] }))} /></Form.Item>}
          <Space><Button onClick={() => setDialog(null)} disabled={saving}>Cancelar</Button><Button htmlType="submit" type="primary" loading={saving} disabled={dialog.type === "offer" && Boolean(plans.error)}>{dialog.type === "offer" ? "Publicar nova versão" : "Salvar"}</Button></Space>
        </Form>
      </Modal>}
      <Modal open={Boolean(partnerResults)} title={`Resultados — ${partnerResults?.name || ""}`} width={900} footer={<Button onClick={() => setPartnerResults(null)}>Fechar</Button>} onCancel={() => setPartnerResults(null)} destroyOnClose>
        {partnerResults && <AffiliateOverview key={partnerResults.id} userId={userId} affiliateId={partnerResults.id} />}
      </Modal>
      <Modal open={Boolean(results)} title={`Resultados — ${results?.title || ""}`} width={1050} footer={<Button onClick={() => setResults(null)}>Fechar</Button>} onCancel={() => setResults(null)} destroyOnClose>
        {results && <LinkResults key={results.id} link={results} userId={userId} />}
      </Modal>
      <Modal open={Boolean(history)} title={`Versões — ${history?.title || ""}`} footer={<Button onClick={() => setHistory(null)}>Fechar</Button>} onCancel={() => setHistory(null)} width={720}>
        {offers.error && <Alert type="error" message={affiliateError(offers.error)} />}
        <Table rowKey="id" loading={offers.isFetching} dataSource={offers.data} pagination={false} locale={{ emptyText: "Nenhuma oferta publicada." }} columns={[
          { title: "Versão", dataIndex: "version" },
          { title: "Desconto", render: (_, row) => row.discountType === "PERCENTAGE" ? `${(row.discountValue / 100).toLocaleString("pt-BR")}%` : (row.discountValue / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) },
          { title: "Adesões até", dataIndex: "endsAt", render: value => value ? new Date(value).toLocaleString("pt-BR") : "Sem data final" },
        ]} />
      </Modal>
    </Space>
  );
}
