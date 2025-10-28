import {
  ArrowLeftOutlined,
  CheckCircleFilled,
  SearchOutlined,
} from "@ant-design/icons";
import { Button, Input, Typography, Select } from "antd";
import { PlanCard, PlansContainer, PlansModules } from "./signup.style";
import { useMemo, useState } from "react";

import { LuFolders } from "react-icons/lu";
import { NewPlanModel } from "@/model/plan.model";

export function ChoosePlanFirstStep({
  plans,
  selectedPlan,
  onSelectPlan,
}: {
  plans: NewPlanModel[];
  selectedPlan: string | null;
  onSelectPlan: (planId: string | null) => void;
}) {
  const [query, setQuery] = useState<string>("");

  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => plan.name.toLowerCase().includes(query));
  }, [query, plans]);

  return (
    <>
      <Typography.Paragraph>Escolha seu plano</Typography.Paragraph>
      <div
        style={{
          marginBottom: 12,
        }}
      >
        <Input
          prefix={<SearchOutlined />}
          value={query}
          onChange={(ev) => setQuery(ev.target.value)}
          placeholder="Buscar plano"
        />
      </div>
      <PlansContainer>
        {filteredPlans.map((plan) => (
          <PlanCardComponent
            key={plan.id}
            plan={plan}
            isSelected={selectedPlan === plan.id}
            onClick={() =>
              onSelectPlan(selectedPlan === plan.id ? null : plan.id)
            }
          />
        ))}
      </PlansContainer>
    </>
  );
}

function getMinimumValue(plan: NewPlanModel): number {
  const values = [
    plan.monthValue,
    plan.quarterlyValue,
    plan.semiannualValue,
    plan.annualValue,
  ].filter((v): v is number => v !== null && v !== undefined && !isNaN(v));

  return values.length > 0 ? Math.min(...values) : 0;
}

function PlanCardComponent({
  plan,
  isSelected,
  onClick,
}: {
  plan: NewPlanModel;
  isSelected: boolean;
  onClick: () => void;
}) {
  const [modulesOpened, setModulesOpened] = useState<boolean>(false);
  const minValue = getMinimumValue(plan);

  return (
    <PlanCard key={plan.id} $selected={isSelected} onClick={() => onClick()}>
      {modulesOpened ? (
        <PlansModules>
          <Typography.Text style={{ fontSize: 12, color: "inherit" }}>
            {plan.modules?.length} Módulo(s)
            <ul>
              {plan.modules?.map((module) => (
                <li key={module.name}>{module.name}</li>
              ))}
            </ul>
          </Typography.Text>
        </PlansModules>
      ) : (
        <>
          <b>{plan.name}</b>
          <div style={{ flex: 1 }}>
            <Typography.Text style={{ fontSize: 12, color: "inherit" }}>
              {plan.description}
            </Typography.Text>
          </div>
          <div>
            <Typography.Text style={{ fontSize: 12, color: "inherit" }}>
              {plan.modules?.length} módulos oferecidos nesse plano
            </Typography.Text>
          </div>
        </>
      )}

      <Button
        size="small"
        type="link"
        icon={
          modulesOpened ? (
            <ArrowLeftOutlined style={{ fontSize: 12 }} />
          ) : (
            <LuFolders style={{ fontSize: 12 }} />
          )
        }
        style={{
          padding: 0,
          margin: "8px 0",
          color: isSelected ? "white" : undefined,
        }}
        onClick={(ev) => {
          ev.stopPropagation();
          setModulesOpened(!modulesOpened);
        }}
      >
        <Typography.Text style={{ fontSize: 12, color: "inherit" }}>
          {modulesOpened ? "Voltar" : "Ver módulos"}
        </Typography.Text>
      </Button>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <div>
          <Typography.Text style={{ fontSize: 10, color: "inherit", opacity: 0.8 }}>
            a partir de
          </Typography.Text>
          <div>
            <b>
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(minValue)}/mês
            </b>
          </div>
        </div>
        {isSelected && <CheckCircleFilled style={{ fontSize: 16 }} />}
      </div>
    </PlanCard>
  );
}

export function CycleSelector({
  plan,
  selectedCycle,
  onCycleChange,
}: {
  plan: NewPlanModel;
  selectedCycle: string;
  onCycleChange: (cycle: string) => void;
}) {
  const getCycleInstallments = (cycleValue: string) => {
    switch (cycleValue) {
      case "MONTHLY":
        return 1;
      case "QUARTERLY":
        return 3;
      case "SEMIANNUALLY":
        return 6;
      case "YEARLY":
        return 12;
      case "LIFETIME":
        return 1;
      default:
        return 1;
    }
  };

  const getAvailableCycles = (planData: NewPlanModel) => {
    const cycles = [];
    if (planData.monthValue) {
      cycles.push({ 
        value: "MONTHLY", 
        label: "Mensal", 
        price: planData.monthValue,
        installments: getCycleInstallments("MONTHLY")
      });
    }
    if (planData.quarterlyValue) {
      cycles.push({ 
        value: "QUARTERLY", 
        label: "Trimestral", 
        price: planData.quarterlyValue,
        installments: getCycleInstallments("QUARTERLY")
      });
    }
    if (planData.semiannualValue) {
      cycles.push({ 
        value: "SEMIANNUALLY", 
        label: "Semestral", 
        price: planData.semiannualValue,
        installments: getCycleInstallments("SEMIANNUALLY")
      });
    }
    if (planData.annualValue) {
      cycles.push({ 
        value: "YEARLY", 
        label: "Anual", 
        price: planData.annualValue,
        installments: getCycleInstallments("YEARLY")
      });
    }
    if (planData.lifetimeValue && planData.allowLifetime) {
      cycles.push({ 
        value: "LIFETIME", 
        label: "Vitalício", 
        price: planData.lifetimeValue,
        installments: getCycleInstallments("LIFETIME")
      });
    }
    return cycles;
  };

  const cycles = getAvailableCycles(plan);

  // Determinar qual ciclo tem o maior período (melhor custo benefício)
  const cycleOrder = ["MONTHLY", "QUARTERLY", "SEMIANNUALLY", "YEARLY", "LIFETIME"];
  const getCycleIndex = (value: string) => cycleOrder.indexOf(value);
  const bestValueCycle = [...cycles].sort((a, b) =>
    getCycleIndex(b.value) - getCycleIndex(a.value)
  )[0]?.value;

  return (
    <Select
      value={selectedCycle}
      onChange={onCycleChange}
      style={{ width: "100%", marginTop: 8 }}
      placeholder="Selecione uma assinatura"
      optionLabelProp="label"
      optionRender={(option) => {
        const cycle = cycles.find(c => c.value === option.value);
        const isLifetime = cycle?.value === "LIFETIME";
        
        return (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <span>
              {cycle?.label} - {isLifetime ? "Pagamento único de " : `${cycle?.installments}x de `}
              {Number(cycle?.price).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </span>
            {option.value === bestValueCycle && (
              <span style={{
                fontSize: 12,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "2px 6px",
                borderRadius: "4px",
              }}>
                ⭐ Melhor custo-benefício
              </span>
            )}
          </div>
        );
      }}
    >
      {cycles.map((cycle) => {
        const isLifetime = cycle.value === "LIFETIME";
        
        return (
          <Select.Option
            key={cycle.value}
            value={cycle.value}
            label={`${cycle.label} - ${isLifetime ? "Pagamento único de " : `${cycle.installments}x de `}${Number(cycle.price).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}${cycle.value === bestValueCycle ? " ⭐" : ""}`}
          >
            {cycle.label} - {isLifetime ? "Pagamento único de " : `${cycle.installments}x de `}
            {Number(cycle.price).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </Select.Option>
        );
      })}
    </Select>
  );
}
