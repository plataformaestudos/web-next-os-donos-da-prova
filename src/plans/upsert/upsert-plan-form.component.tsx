"use client";

import { Divider, Flex, Input, InputNumber, Typography, Checkbox } from "antd";
import styled from "styled-components";
import { useState } from "react";
import { ModuleViewModel } from "@/model/module.model";
import { ModulesTree } from "@/modules/tree/modules-tree.component";
import { UPSERT_PLAN_FORM_ID } from "./upsert-plan-form.constant";
import { useUpsertPlan } from "./upsert-plan.context";

export interface PlanFormValues {
  id?: string;
  name: string;
  description: string;
  isFree: boolean;
  durationDays?: number;
  questionLimit?: number;
  monthValue?: number;
  quarterlyValue?: number;
  semiannualValue?: number;
  yearlyValue?: number;
  lifetimeValue?: number;
  modules: string[];
}

interface UpsertPlanFormProps {
  plan?: PlanFormValues | null;
  modules: {
    loadData: (key: string) => Promise<Array<ModuleViewModel>>;
    data: Array<ModuleViewModel>;
  };
}

export function UpsertPlanForm({ plan, modules }: UpsertPlanFormProps) {
  const { upsertPlan, error } = useUpsertPlan();

  const [values, setValues] = useState<PlanFormValues>({
    id: plan?.id,
    name: plan?.name || "",
    description: plan?.description || "",
    isFree: plan?.isFree ?? false,
    durationDays: plan?.durationDays || 0,
    questionLimit: plan?.questionLimit || 0,
    monthValue: plan?.monthValue || 0,
    quarterlyValue: plan?.quarterlyValue || 0,
    semiannualValue: plan?.semiannualValue || 0,
    yearlyValue: plan?.yearlyValue || 0,
    lifetimeValue: plan?.lifetimeValue || 0,
    modules: plan?.modules || []
  });

  const handleChange = <K extends keyof PlanFormValues>(
    field: K,
    value: PlanFormValues[K]
  ) => {
    setValues(v => ({ ...v, [field]: value }));
  };


  const handleSubmit = () => {
    upsertPlan(values);
  };

  return (
    <Container>
      <form id={UPSERT_PLAN_FORM_ID} action={handleSubmit}>
        {values.id && (
          <Flex vertical style={{ opacity: 0.6 }}>
            <Label>ID</Label>
            <Typography.Text copyable>{values.id}</Typography.Text>
            <Divider />
          </Flex>
        )}

        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          value={values.name}
          onChange={e => handleChange("name", e.target.value)}
        />
        <Divider />

        <Label htmlFor="description">Descrição</Label>
        <Input
          id="description"
          value={values.description}
          onChange={e => handleChange("description", e.target.value)}
        />
        <Divider />

        <Checkbox
          checked={values.isFree}
          onChange={e => handleChange("isFree", e.target.checked)}
        >
          Free Trial
        </Checkbox>
        <Divider />

        {values.isFree && (
          <>
            <Flex style={{ gap: 16 }}>
              <Flex vertical style={{ flex: 1 }}>
                <Label htmlFor="durationDays">Duração (dias)</Label>
                <InputNumber
                  id="durationDays"
                  value={values.durationDays}
                  onChange={val => handleChange("durationDays",  val ?? undefined)}
                  style={{ width: '100%' }}
                  min={0}
                />
              </Flex>

              <Flex vertical style={{ flex: 1 }}>
                <Label htmlFor="questionLimit">Limite de Questões</Label>
                <InputNumber
                  id="questionLimit"
                  value={values.questionLimit}
                  onChange={val => handleChange("questionLimit",  val ?? undefined)}
                  style={{ width: '100%' }}
                  min={0}
                />
              </Flex>
            </Flex>
            <Divider />
          </>
        )}

        <Label>Faixa de Valores</Label>
        <Flex style={{ gap: 16, flexWrap: 'wrap' }}>
          <Flex vertical style={{ flex: 1, minWidth: 120 }}>
            <Label>Mensal</Label>
            <InputNumber
              id="monthValue"
              value={values.monthValue}
              prefix="R$"
              step={0.01}
              onChange={val => handleChange("monthValue",  val ?? undefined)}
              style={{ width: '100%' }}
              disabled={values.isFree}
            />
          </Flex>
          <Flex vertical style={{ flex: 1, minWidth: 120 }}>
            <Label>Trimestral</Label>
            <InputNumber
              id="quarterlyValue"
              value={values.quarterlyValue}
              prefix="R$"
              step={0.01}
              onChange={val => handleChange("quarterlyValue",  val ?? undefined)}
              style={{ width: '100%' }}
              disabled={values.isFree}
            />
          </Flex>
          <Flex vertical style={{ flex: 1, minWidth: 120 }}>
            <Label>Semestral</Label>
            <InputNumber
              id="semiannualValue"
              value={values.semiannualValue}
              prefix="R$"
              step={0.01}
              onChange={val => handleChange("semiannualValue",  val ?? undefined)}
              style={{ width: '100%' }}
              disabled={values.isFree}
            />
          </Flex>
          <Flex vertical style={{ flex: 1, minWidth: 120 }}>
            <Label>Anual</Label>
            <InputNumber
              id="yearlyValue"
              value={values.yearlyValue}
              prefix="R$"
              step={0.01}
              onChange={val => handleChange("yearlyValue",  val ?? undefined)}
              style={{ width: '100%' }}
              disabled={values.isFree}
            />
          </Flex>
          <Flex vertical style={{ flex: 1, minWidth: 120 }}>
            <Label>Vitalício</Label>
            <InputNumber
              id="lifetimeValue"
              value={values.lifetimeValue}
              prefix="R$"
              step={0.01}
              onChange={val => handleChange("lifetimeValue",  val ?? undefined)}
              style={{ width: '100%' }}
              disabled={values.isFree}
            />
          </Flex>
        </Flex>

        <Divider />

        <Label>Módulos</Label>
        <ModulesTree
          modules={modules.data}
          loadData={modules.loadData}
          readonly
          checkable
          autoExpand
          defaultCheckedKeys={values.modules}
          onCheck={({ checkedRoots }) => {
            handleChange("modules", checkedRoots.map(m => m.id));
          }}
        />
      </form>

      {error && <Typography.Text type="danger">{error}</Typography.Text>}
    </Container>
  );
}

const Container = styled.div`
  background-color: ${({ theme }) => theme.colorBgContainer};
  border-radius: 6px;
  padding: 16px;
`;

export const Label = styled.label`
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 8px;
`;
