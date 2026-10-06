"use client";

import { Divider, Flex, Input, InputNumber, Typography, Checkbox, Tag, Space, AutoComplete, Tooltip, Select } from "antd";
import styled from "styled-components";
import { useState, useEffect, useMemo } from "react";
import { ModuleViewModel } from "@/model/module.model";
import { ModulesTree } from "@/modules/tree/modules-tree.component";
import { UPSERT_PLAN_FORM_ID } from "./upsert-plan-form.constant";
import { useUpsertPlan } from "./upsert-plan.context";
import { queryModules } from "@/modules/tree/load-modules.action";
import { recurringCycles } from "@/plans/plan-price-display";

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
  annualValue?: number;
  cardDisplayCycle?: "MONTHLY" | "QUARTERLY" | "SEMIANNUALLY" | "YEARLY" | null;
  cardDisplayMode: "CYCLE_TOTAL" | "MONTHLY_EQUIVALENT";
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
    annualValue: plan?.annualValue || 0,
    cardDisplayCycle: plan?.cardDisplayCycle ?? (plan?.monthValue ? "MONTHLY" : plan?.quarterlyValue ? "QUARTERLY" : plan?.semiannualValue ? "SEMIANNUALLY" : plan?.annualValue ? "YEARLY" : null),
    cardDisplayMode: plan?.cardDisplayMode ?? "MONTHLY_EQUIVALENT",
    lifetimeValue: plan?.lifetimeValue || 0,
    modules: plan?.modules || []
  });

  const [searchValue, setSearchValue] = useState("");
  const [filteredModules, setFilteredModules] = useState<ModuleViewModel[]>([]);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);
  const [addedModules, setAddedModules] = useState<ModuleViewModel[]>([]);

  const availableDisplayCycles = useMemo(() => recurringCycles.filter(({ value }) => {
    const price = value === "MONTHLY" ? values.monthValue
      : value === "QUARTERLY" ? values.quarterlyValue
      : value === "SEMIANNUALLY" ? values.semiannualValue
      : values.annualValue;
    return price != null && price > 0;
  }), [values.monthValue, values.quarterlyValue, values.semiannualValue, values.annualValue]);

  const handleChange = <K extends keyof PlanFormValues>(
    field: K,
    value: PlanFormValues[K]
  ) => {
    setValues(v => ({ ...v, [field]: value }));
  };

  const searchModules = (query: string) => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    if (!query.trim()) {
      setFilteredModules([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const modules = await queryModules(query);
        setFilteredModules(modules);
      } catch (error) {
        console.error("Erro ao buscar módulos:", error);
        setFilteredModules([]);
      }
    }, 300); // 300ms de debounce

    setDebounceTimeout(timeout);
  };

  useEffect(() => {
    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [debounceTimeout]);

  useEffect(() => {
    if (values.isFree || !availableDisplayCycles.length) {
      if (values.cardDisplayCycle !== null) handleChange("cardDisplayCycle", null);
      return;
    }
    if (availableDisplayCycles.length && !availableDisplayCycles.some(cycle => cycle.value === values.cardDisplayCycle)) {
      handleChange("cardDisplayCycle", availableDisplayCycles[0].value);
    }
  }, [values.isFree, values.cardDisplayCycle, availableDisplayCycles]);


  const getSelectedModules = () => {
    const existingModules = modules.data.filter(module => 
      values.modules.includes(module.id)
    );
    
    const newlyAddedModules = addedModules.filter(module => 
      values.modules.includes(module.id) && 
      !modules.data.some(existing => existing.id === module.id)
    );
    
    return [...existingModules, ...newlyAddedModules];
  };

  const handleAddModule = (moduleId: string) => {
    if (!values.modules.includes(moduleId)) {
      handleChange("modules", [...values.modules, moduleId]);
      
      const moduleToAdd = filteredModules.find(m => m.id === moduleId);
      if (moduleToAdd && !modules.data.some(existing => existing.id === moduleId)) {
        setAddedModules(prev => [...prev, moduleToAdd]);
      }
    }
    setSearchValue("");
  };

  const handleRemoveModule = (moduleId: string) => {
    const newModules = values.modules.filter(id => id !== moduleId);
    handleChange("modules", newModules);
    
    setAddedModules(prev => prev.filter(m => m.id !== moduleId));
  };

  const truncateModuleName = (name: string, maxLength: number = 50) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + "...";
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

        <Label>Valores</Label>
        
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
              id="annualValue"
              value={values.annualValue}
              prefix="R$"
              step={0.01}
              onChange={val => handleChange("annualValue",  val ?? undefined)}
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

        {!values.isFree && <>
          <Divider />
          <Label>Preço destacado no card de assinatura</Label>
          <Flex style={{ gap: 16, flexWrap: 'wrap' }}>
            <Flex vertical style={{ flex: 1, minWidth: 220 }}>
              <Label>Ciclo usado para divulgar o preço</Label>
              <Select
                value={values.cardDisplayCycle ?? undefined}
                placeholder="Selecione um ciclo com valor cadastrado"
                options={availableDisplayCycles.map(cycle => ({ value: cycle.value, label: cycle.label }))}
                onChange={value => handleChange("cardDisplayCycle", value)}
                disabled={!availableDisplayCycles.length}
              />
            </Flex>
            <Flex vertical style={{ flex: 1, minWidth: 220 }}>
              <Label>Como mostrar o valor</Label>
              <Select
                value={values.cardDisplayMode}
                options={[
                  { value: "CYCLE_TOTAL", label: "Valor total cobrado no ciclo" },
                  { value: "MONTHLY_EQUIVALENT", label: "Equivalente mensal do ciclo" },
                ]}
                onChange={value => handleChange("cardDisplayMode", value)}
                disabled={!availableDisplayCycles.length}
              />
            </Flex>
          </Flex>
          <Typography.Text type="secondary">
            Mesmo quando o card mostrar o equivalente mensal, ele também informará o total cobrado e a frequência da cobrança.
          </Typography.Text>
        </>}

        <Divider />

        <Label>Módulos</Label>
        
        {values.id ? (
          // Modo de edição 
          <Flex vertical style={{ gap: 16, marginTop: 16 }}>
            <Space wrap>
              {getSelectedModules().map(module => (
                <Tooltip key={module.id} title={module.name}>
                  <Tag 
                    color="blue" 
                    style={{ fontSize: '14px', padding: '4px 8px', maxWidth: '450px' }}
                    closable
                    onClose={() => handleRemoveModule(module.id)}
                  >
                    {truncateModuleName(module.name)}
                  </Tag>
                </Tooltip>
              ))}
              {getSelectedModules().length === 0 && (
                <Typography.Text type="secondary">
                  Nenhum módulo selecionado
                </Typography.Text>
              )}
            </Space>
            
            <div>
              <Typography.Text strong>Adicionar módulo:</Typography.Text>
              <AutoComplete
                style={{ width: '100%', marginTop: 8 }}
                value={searchValue}
                onChange={(value) => {
                  setSearchValue(value);
                  searchModules(value);
                }}
                placeholder="Digite o nome do módulo..."
                options={filteredModules.map(module => ({
                  value: module.id,
                  label: module.name,
                }))}
                onSelect={(value) => handleAddModule(value)}
              />
            </div>
          </Flex>
        ) : (
          // Modo de criação 
          <ModulesTree
            modules={modules.data}
            loadData={modules.loadData}
            readonly
            checkable
            onCheck={({ checkedRoots }) => {
              handleChange("modules", checkedRoots.map(m => m.id));
            }}
          />
        )}
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
