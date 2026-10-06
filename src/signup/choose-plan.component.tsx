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
import { formatCycleCharge, getBestValueCycle, getPlanCardPrice, getPlanRecurringPrices } from "@/plans/plan-price-display";

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
    return plans.filter((plan) => (plan.isFree || getPlanRecurringPrices(plan).length > 0) && plan.name.toLowerCase().includes(query));
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
  const cardPrice = getPlanCardPrice(plan);

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
            {cardPrice && <>
              <div><b>{cardPrice.headline}</b></div>
              <Typography.Text style={{ fontSize: 10, color: "inherit", opacity: 0.8 }}>
                {cardPrice.detail}
              </Typography.Text>
            </>}
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
  const getAvailableCycles = (planData: NewPlanModel) => {
    const cycles = [];
    if (planData.monthValue) {
      cycles.push({ 
        value: "MONTHLY", 
        label: "Mensal", 
        price: planData.monthValue,
      });
    }
    if (planData.quarterlyValue) {
      cycles.push({ 
        value: "QUARTERLY", 
        label: "Trimestral", 
        price: planData.quarterlyValue,
      });
    }
    if (planData.semiannualValue) {
      cycles.push({ 
        value: "SEMIANNUALLY", 
        label: "Semestral", 
        price: planData.semiannualValue,
      });
    }
    if (planData.annualValue) {
      cycles.push({ 
        value: "YEARLY", 
        label: "Anual", 
        price: planData.annualValue,
      });
    }

    return cycles;
  };

  const cycles = getAvailableCycles(plan);

  const bestValueCycle = getBestValueCycle(cycles);

  return (
    <Select
      value={selectedCycle}
      onChange={onCycleChange}
      style={{ width: "100%", marginTop: 8 }}
      placeholder="Selecione uma assinatura"
      optionLabelProp="label"
      optionRender={(option) => {
        const cycle = cycles.find(c => c.value === option.value);
        
        return (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <span>
              {cycle?.label} - {cycle && formatCycleCharge(cycle.value, cycle.price)}
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
        return (
          <Select.Option
            key={cycle.value}
            value={cycle.value}
            label={`${cycle.label} - ${formatCycleCharge(cycle.value, cycle.price)}${cycle.value === bestValueCycle ? " ⭐" : ""}`}
          >
            {cycle.label} - {formatCycleCharge(cycle.value, cycle.price)}
          </Select.Option>
        );
      })}
    </Select>
  );
}
