import {
  ArrowLeftOutlined,
  CheckCircleFilled,
  SearchOutlined,
} from "@ant-design/icons";
import { Button, Input, Typography } from "antd";
import { PlanCard, PlansContainer, PlansModules } from "./signup.style";
import { useMemo, useState } from "react";

import { LuFolders } from "react-icons/lu";

export function ChoosePlanFirstStep({
  plans,
  selectedPlan,
  onSelectPlan,
}: {
  plans: {
    id: string;
    name: string;
    description: string;
    price: number;
    modules: {
      name: string;
    }[];
  }[];
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

function PlanCardComponent({
  plan,
  isSelected,
  onClick,
}: {
  plan: {
    id: string;
    name: string;
    description: string;
    price: number;
    modules: {
      name: string;
    }[];
  };
  isSelected: boolean;
  onClick: () => void;
}) {
  const [modulesOpened, setModulesOpened] = useState<boolean>(false);
  return (
    <PlanCard key={plan.id} $selected={isSelected} onClick={() => onClick()}>
      {modulesOpened ? (
        <PlansModules>
          <Typography.Text style={{ fontSize: 12, color: "inherit" }}>
            {plan.modules.length} Módulos
            <ul>
              {plan.modules.map((module) => (
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
              {plan.modules.length} módulos oferecidos nesse plano
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
        <b>
          {new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(plan.price)}
        </b>
        {isSelected && <CheckCircleFilled style={{ fontSize: 16 }} />}
      </div>
    </PlanCard>
  );
}
