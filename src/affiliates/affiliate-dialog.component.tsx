"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import type { AriaAttributes, CSSProperties } from "react";
import { Alert, Button, Checkbox, Drawer, Empty, Form, Input, InputNumber, Modal, Radio, Select, Skeleton, Typography, theme } from "antd";
import type { Affiliate, AffiliateInput, AffiliateLink, AffiliatePlan, LinkInput } from "./affiliates.api";
import styles from "./affiliate-dialog.module.css";

export type AffiliateDialog = { type: "affiliate"; row?: Affiliate } | { type: "link"; row?: AffiliateLink } | { type: "offer"; row: AffiliateLink };
export type OfferValues = { discountType: "FIXED" | "PERCENTAGE"; amount: number; startsAt?: string; endsAt?: string; planIds: string[]; selections: string[] };

interface AffiliateDialogFormProps {
  dialog: AffiliateDialog | null;
  saving: boolean;
  formError: string | null;
  affiliateChoices: Affiliate[];
  affiliateChoicesLoading: boolean;
  affiliateChoicesError: boolean;
  plans: AffiliatePlan[];
  plansLoading: boolean;
  plansError: boolean;
  onCancel: () => void;
  onSave: (values: AffiliateInput | LinkInput | OfferValues) => Promise<void>;
}

const statusLabels: Record<string, string> = { ACTIVE: "Ativo", INACTIVE: "Inativo", PAUSED: "Pausado", ARCHIVED: "Arquivado" };
const sourceLabels = { INFLUENCER: "Influencer", EBOOK: "Ebook", CAMPAIGN: "Campanha própria" };
const cycleLabels: Record<string, string> = { MONTHLY: "Mensal", QUARTERLY: "Trimestral", SEMIANNUALLY: "Semestral", YEARLY: "Anual" };
const money = (cents: number) => (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

type PlanCyclesProps = AriaAttributes & {
  plans: AffiliatePlan[];
  value?: string[];
  onChange?: (value: string[]) => void;
  disabled: boolean;
  id?: string;
};
type PlanCyclesHandle = { nativeElement: HTMLDivElement | null; focus: () => void };

const PlanCycles = forwardRef<PlanCyclesHandle, PlanCyclesProps>(function PlanCycles({ plans, value = [], onChange, disabled, id, ...ariaAttributes }, ref) {
  const groupRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => ({
    nativeElement: groupRef.current,
    focus: () => {
      const checkbox = groupRef.current?.querySelector<HTMLInputElement>('input[type="checkbox"]:not(:disabled)');
      if (checkbox) checkbox.focus();
      else groupRef.current?.focus();
    },
  }));
  return <div {...ariaAttributes} ref={groupRef} id={id} role="group" aria-label={ariaAttributes["aria-label"] || "Planos e ciclos disponíveis"} tabIndex={-1} className={styles.planList}>
    {plans.map(plan => {
      const keys = plan.cycles.map(({ cycle }) => `${plan.id}:${cycle}`);
      const selected = keys.filter(key => value.includes(key));
      return <div key={plan.id} className={`${styles.planCard} ${selected.length ? styles.selectedPlan : ""}`}>
        <Checkbox
          disabled={disabled || !keys.length}
          checked={Boolean(keys.length) && selected.length === keys.length}
          indeterminate={selected.length > 0 && selected.length < keys.length}
          onChange={event => onChange?.(event.target.checked ? [...new Set([...value, ...keys])] : value.filter(key => !keys.includes(key)))}
          className={styles.planName}
        >{plan.name}</Checkbox>
        {keys.length ? <div className={styles.cycles}>
          {plan.cycles.map(({ cycle, baseAmountCents }) => {
            const key = `${plan.id}:${cycle}`;
            return <Checkbox key={key} checked={value.includes(key)} disabled={disabled} onChange={event => onChange?.(event.target.checked ? [...value, key] : value.filter(item => item !== key))}>
              <span className={styles.cycleLabel}>{cycleLabels[cycle] || cycle}<span className={styles.cyclePrice}>{money(baseAmountCents)} por ciclo</span></span>
            </Checkbox>;
          })}
        </div> : <Typography.Text type="secondary">Nenhum ciclo disponível para este plano.</Typography.Text>}
      </div>;
    })}
  </div>;
});

export function AffiliateDialogForm(props: AffiliateDialogFormProps) {
  if (!props.dialog) return null;
  return <DialogContent key={`${props.dialog.type}-${props.dialog.row?.id || "new"}`} {...props} dialog={props.dialog} />;
}

function DialogContent({ dialog, saving, formError, affiliateChoices, affiliateChoicesLoading, affiliateChoicesError, plans, plansLoading, plansError, onCancel, onSave }: Omit<AffiliateDialogFormProps, "dialog"> & { dialog: AffiliateDialog }) {
  const [form] = Form.useForm();
  const { token } = theme.useToken();
  const discountType: OfferValues["discountType"] | undefined = Form.useWatch("discountType", form);
  const isOffer = dialog.type === "offer";
  const isEditing = Boolean(dialog.row);
  const cancel = () => { if (!saving) onCancel(); };
  const variables = {
    "--affiliate-dialog-border": token.colorBorderSecondary,
    "--affiliate-dialog-muted": token.colorTextSecondary,
    "--affiliate-dialog-surface": token.colorFillAlter,
    "--affiliate-dialog-primary": token.colorPrimary,
    "--affiliate-dialog-selected": token.colorPrimaryBg,
  } as CSSProperties;
  const footer = <div className={styles.footer}>
    <Button onClick={cancel} disabled={saving}>Cancelar</Button>
    <Button type="primary" loading={saving} disabled={isOffer && (plansError || plansLoading || !plans.length)} onClick={() => form.submit()}>{isOffer ? "Publicar nova versão" : "Salvar"}</Button>
  </div>;
  const title = <div className={styles.title}>
    <Typography.Title level={4}>{isOffer ? "Nova oferta" : dialog.type === "affiliate" ? isEditing ? "Editar afiliado" : "Novo afiliado" : isEditing ? "Editar link / campanha" : "Novo link / campanha"}</Typography.Title>
    <Typography.Text type="secondary">{dialog.type === "offer" ? dialog.row.title : dialog.type === "affiliate" ? "Organize os dados do seu parceiro." : "Identifique a campanha e a origem das novas adesões."}</Typography.Text>
  </div>;
  const contents = <div className={styles.content} style={variables}>
    <Form
      form={form}
      layout="vertical"
      requiredMark="optional"
      disabled={saving}
      initialValues={isOffer ? { discountType: "PERCENTAGE", planIds: [], selections: [] } : { status: "ACTIVE", source: "CAMPAIGN", ...dialog.row }}
      onValuesChange={changed => {
        if ("selections" in changed) {
          const nextSelections: string[] = changed.selections || [];
          form.setFieldValue("planIds", plans.filter(plan => plan.cycles.some(({ cycle }) => nextSelections.includes(`${plan.id}:${cycle}`))).map(plan => plan.id));
        }
      }}
      onFinish={onSave}
      scrollToFirstError={{ focus: true }}
    >
      {formError && <Alert type="error" showIcon message={formError} className={styles.formError} />}
      {dialog.type === "affiliate" ? <section className={styles.section}>
        <Typography.Title level={5} className={styles.sectionTitle}>Dados do afiliado</Typography.Title>
        <div className={styles.panel}>
          <Form.Item name="name" label="Nome" rules={[{ required: true, whitespace: true, message: "Informe o nome do afiliado." }]}><Input autoFocus maxLength={150} placeholder="Nome do parceiro" /></Form.Item>
          <Form.Item name="externalReference" label="Referência externa"><Input maxLength={200} placeholder="Identificador usado pela sua equipe" /></Form.Item>
          <Form.Item name="contact" label="Contato"><Input maxLength={250} placeholder="Email, telefone ou perfil nas redes sociais" /></Form.Item>
        </div>
      </section> : dialog.type === "link" ? <section className={styles.section}>
        <Typography.Title level={5} className={styles.sectionTitle}>Dados da campanha</Typography.Title>
        <div className={styles.panel}>
          <Form.Item name="title" label="Título" rules={[{ required: true, whitespace: true, message: "Informe o título da campanha." }]}><Input autoFocus maxLength={200} placeholder="Nome para identificar a campanha" /></Form.Item>
          <Form.Item name="slug" label="Identificador público" extra="Use letras minúsculas, números e hífens. O identificador é definido na criação." rules={[{ required: true, message: "Informe o identificador do link." }, { pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, message: "Use letras minúsculas, números e hífens." }]}><Input maxLength={100} disabled={isEditing} placeholder="minha-campanha" /></Form.Item>
          <div className={styles.fieldGrid}>
            <Form.Item name="source" label="Origem" rules={[{ required: true, message: "Selecione a origem." }]}><Select disabled={isEditing} options={Object.entries(sourceLabels).map(([value, label]) => ({ value, label }))} /></Form.Item>
            <Form.Item name="affiliateId" label="Afiliado"><Select disabled={isEditing} allowClear showSearch optionFilterProp="label" loading={affiliateChoicesLoading} placeholder="Sem afiliado" options={affiliateChoices.map(row => ({ value: row.id, label: row.name }))} /></Form.Item>
          </div>
          {affiliateChoicesError && <Alert type="error" showIcon message="Não foi possível carregar os afiliados." />}
        </div>
      </section> : <>
        <section className={styles.section}>
          <Typography.Title level={5} className={styles.sectionTitle}>1. Desconto</Typography.Title>
          <div className={styles.panel}>
            <Form.Item name="discountType" label="Tipo de desconto" rules={[{ required: true, message: "Selecione o tipo de desconto." }]}>
              <Radio.Group optionType="button" buttonStyle="solid" options={[{ value: "PERCENTAGE", label: "Porcentagem" }, { value: "FIXED", label: "Valor em reais" }]} />
            </Form.Item>
            <Form.Item name="amount" label="Desconto aplicado" dependencies={["discountType"]} extra="Para novos usuários ou contas Free." rules={[
              { required: true, message: "Informe o desconto." },
              ({ getFieldValue }) => ({ validator: (_, value: number | null | undefined) => {
                if (value == null) return Promise.resolve();
                if (!Number.isFinite(value) || value <= 0) return Promise.reject(new Error("Informe um valor de desconto maior que zero."));
                if (getFieldValue("discountType") === "PERCENTAGE" && value > 100) return Promise.reject(new Error("O desconto percentual deve ser de até 100%."));
                return Promise.resolve();
              } }),
            ]}>
              <InputNumber min={0.01} max={discountType === "PERCENTAGE" ? 100 : undefined} precision={2} decimalSeparator="," addonBefore={discountType === "FIXED" ? "R$" : undefined} addonAfter={discountType === "FIXED" ? undefined : "%"} className={styles.amount} />
            </Form.Item>
          </div>
        </section>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <Typography.Title level={5} className={styles.sectionTitle}>2. Planos e ciclos</Typography.Title>
            <Typography.Text type="secondary">Ciclos disponíveis no catálogo.</Typography.Text>
          </div>
          {plansError ? <Alert type="error" showIcon message="Não foi possível carregar os planos." /> : plansLoading ? <Skeleton active paragraph={{ rows: 3 }} /> : !plans.length ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Nenhum plano disponível para esta oferta." /> : null}
          <Form.Item name="planIds" hidden><Input /></Form.Item>
          <Form.Item name="selections" aria-label="Planos e ciclos" rules={[
            { required: true, type: "array", min: 1, message: "Selecione ao menos um ciclo de um plano." },
            { validator: (_, values: string[] | undefined) => !values?.length || values.every(value => plans.some(plan => plan.cycles.some(({ cycle }) => value === `${plan.id}:${cycle}`))) ? Promise.resolve() : Promise.reject(new Error("Selecione novamente os ciclos disponíveis no catálogo.")) },
            ({ getFieldValue }) => ({ validator: (_, values: string[] | undefined) => {
              const planIds: string[] = getFieldValue("planIds") || [];
              return planIds.every(id => values?.some(value => value.startsWith(`${id}:`))) ? Promise.resolve() : Promise.reject(new Error("Selecione ao menos um ciclo para cada plano."));
            } }),
          ]}>
            <PlanCycles plans={plans} disabled={saving || plansLoading || plansError} />
          </Form.Item>
        </section>
        <section className={styles.section}>
          <Typography.Title level={5} className={styles.sectionTitle}>3. Período para novas adesões</Typography.Title>
          <div className={styles.panel}>
            <div className={styles.fieldGrid}>
              <Form.Item name="startsAt" label="Início das adesões" extra="Deixe vazio para início imediato."><Input type="datetime-local" /></Form.Item>
              <Form.Item name="endsAt" label="Fim das adesões" dependencies={["startsAt"]} extra="Deixe vazio para não definir data final." rules={[({ getFieldValue }) => ({ validator: (_, value: string | undefined) => !value || !getFieldValue("startsAt") || new Date(value) > new Date(getFieldValue("startsAt")) ? Promise.resolve() : Promise.reject(new Error("O fim deve ser posterior ao início.")) })]}><Input type="datetime-local" /></Form.Item>
            </div>
            <Typography.Paragraph type="secondary">As datas usam o horário local do seu dispositivo.</Typography.Paragraph>
            <Alert type="warning" showIcon message="A nova oferta substitui a anterior ao publicar." description="Com início futuro, a campanha ficará indisponível para novas adesões até essa data." />
            <Typography.Paragraph type="secondary" className={styles.note}>O desconto permanece na assinatura contratada. As datas limitam apenas novas adesões.</Typography.Paragraph>
          </div>
        </section>
        {/* <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <Typography.Title level={5} className={styles.sectionTitle}>4. Resumo antes de publicar</Typography.Title>
            <Typography.Text type="secondary">Valores totais por ciclo.</Typography.Text>
          </div>
          <div className={styles.summary}>
            <Table dataSource={selectedRows} rowKey="key" size="small" pagination={false} scroll={{ x: 430 }} locale={{ emptyText: "Selecione os planos e ciclos para revisar a oferta." }} columns={[
              { title: "Plano", dataIndex: "planName" },
              { title: "Ciclo", dataIndex: "cycle", render: (cycle: string) => cycleLabels[cycle] || cycle },
              { title: "Preço regular", dataIndex: "baseAmountCents", align: "right", render: (cents: number) => money(cents) },
            ]} />
          </div>
          <Typography.Paragraph type="secondary" className={styles.note}>O valor final da contratação é validado pela plataforma ao aplicar o desconto.</Typography.Paragraph>
        </section> */}
      </>}
      {!isOffer && dialog.row && <section className={styles.section}>
        <Typography.Title level={5} className={styles.sectionTitle}>Situação do cadastro</Typography.Title>
        <div className={styles.panel}>
          <Form.Item name="status" label="Status" rules={[{ required: true, message: "Selecione o status." }]}><Select options={(dialog.type === "affiliate" ? ["ACTIVE", "INACTIVE", "ARCHIVED"] : ["ACTIVE", "PAUSED", "ARCHIVED"]).map(value => ({ value, label: statusLabels[value] }))} /></Form.Item>
        </div>
      </section>}
    </Form>
  </div>;
  return isOffer ? <Drawer open title={title} width="min(820px, 100vw)" onClose={cancel} maskClosable={!saving} closable={!saving} keyboard={!saving} footer={footer} className={styles.drawer}>{contents}</Drawer> : <Modal open title={title} width={620} onCancel={cancel} maskClosable={!saving} closable={!saving} keyboard={!saving} footer={footer} className={styles.modal}>{contents}</Modal>;
}
