"use client";

import { Divider, Flex, Input, InputNumber, Typography } from "antd";

import { ModuleViewModel } from "@/model/module.model";
import { ModulesTree } from "@/modules/tree/modules-tree.component";
import { UPSERT_PLAN_FORM_ID } from "./upsert-plan-form.constant";
import styled from "styled-components";
import { useState } from "react";
import { useUpsertPlan } from "./upsert-plan.context";

interface UpsertPlanFormProps {
  plan?: {
    id?: string;
    name?: string;
    price?: number;
    modules?: string[];
  } | null;
  modules: {
    loadData: (key: string) => Promise<Array<ModuleViewModel>>;
    data: Array<ModuleViewModel>;
  };
}

export function UpsertPlanForm({ plan, modules }: UpsertPlanFormProps) {
  const { upsertPlan, error } = useUpsertPlan();

  const [name, setName] = useState(plan?.name ?? "");
  const [price, setPrice] = useState(plan?.price ?? 0);
  const [selectedModules, setSelectedModules] = useState(plan?.modules ?? []);

  return (
    <Container>
      <form
        id={UPSERT_PLAN_FORM_ID}
        action={() =>
          upsertPlan({
            id: plan?.id,
            name,
            price,
            modules: selectedModules,
          })
        }
      >
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          name="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <Divider />
        <Flex vertical>
          <Label htmlFor="price">Preço</Label>
          <InputNumber
            style={{ width: "100%" }}
            id="price"
            name="price"
            type="number"
            prefix="R$"
            step="0.01"
            value={price}
            onChange={(value) => setPrice(Number(value))}
          />
        </Flex>
        <Divider />
        <Label>Módulos</Label>
        <ModulesTree
          modules={modules.data}
          loadData={modules.loadData}
          readonly
          checkable
          defaultCheckedKeys={plan?.modules}
          onCheck={({ checkedRoots: modules }) => {
            setSelectedModules(modules.map((module) => module.id));
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
