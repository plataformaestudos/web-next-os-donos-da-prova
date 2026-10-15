import { ArrowLeftOutlined, CheckOutlined, SearchOutlined, StarFilled } from "@ant-design/icons";
import { Button, Empty, Input, Typography } from "antd";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { LuFolders } from "react-icons/lu";
import { NewPlanModel } from "@/model/plan.model";
import { formatCycleCharge, getPlanRecurringPrices } from "@/plans/plan-price-display";
import { ReferralPlanCode, ReferralPlanPrice, useReferralPlans } from "@/affiliates/referral-plans.component";
import { previewPrice } from "@/affiliates/referral-preview";
import { PlansContainer, PlansModules } from "./signup.style";
import { CycleOption, CycleSelect, CyclePopup, ModuleActions, PlanDescription, PlanFlipCard, PlanFlipFace, PlanFlipInner, PlanHeading, PlanPrice, PlanSelection, PlanSelectionIndicator, PlanSearchHeader } from "./choose-plan.style";

export function ChoosePlanFirstStep({ plans, selectedPlan, onSelectPlan }: {
  plans: NewPlanModel[];
  selectedPlan: string | null;
  onSelectPlan: (planId: string | null) => void;
}) {
  const [query, setQuery] = useState("");
  const searchId = useId();
  const availablePlans = useMemo(() => plans.filter(plan => plan.isFree || getPlanRecurringPrices(plan).length > 0), [plans]);
  const filteredPlans = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
    return availablePlans.filter(plan => plan.name.toLocaleLowerCase("pt-BR").includes(normalizedQuery));
  }, [availablePlans, query]);

  return (
    <section aria-label="Escolha seu plano">
      <ReferralPlanCode />
      <PlanSearchHeader>
        <label htmlFor={searchId}>Escolha seu plano</label>
        <Typography.Text type="secondary" role="status">
          {filteredPlans.length} {filteredPlans.length === 1 ? "plano disponível" : "planos disponíveis"}
        </Typography.Text>
      </PlanSearchHeader>
      <Input
        id={searchId}
        size="large"
        allowClear
        prefix={<SearchOutlined aria-hidden />}
        value={query}
        onChange={event => setQuery(event.target.value)}
        placeholder="Buscar plano..."
        style={{ marginBottom: 20 }}
      />
      {filteredPlans.length ? (
        <PlansContainer aria-label="Planos disponíveis">
          {filteredPlans.map(plan => (
            <PlanCardComponent
              key={plan.id}
              plan={plan}
              isSelected={selectedPlan === plan.id}
              onClick={() => onSelectPlan(selectedPlan === plan.id ? null : plan.id)}
            />
          ))}
        </PlansContainer>
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={availablePlans.length ? "Nenhum plano encontrado para esta busca." : "Não há planos disponíveis para contratação no momento."}
        >
          {availablePlans.length > 0 && <Button onClick={() => setQuery("")}>Limpar busca</Button>}
        </Empty>
      )}
    </section>
  );
}

function PlanCardComponent({ plan, isSelected, onClick }: {
  plan: NewPlanModel;
  isSelected: boolean;
  onClick: () => void;
}) {
  const [modulesOpened, setModulesOpened] = useState(false);
  const previousModulesOpened = useRef(modulesOpened);
  const modulesButtonRef = useRef<HTMLButtonElement>(null);
  const returnButtonRef = useRef<HTMLButtonElement>(null);
  const modulesId = useId();
  const modules = plan.modules ?? [];

  useEffect(() => {
    if (previousModulesOpened.current === modulesOpened) return;
    (modulesOpened ? returnButtonRef : modulesButtonRef).current?.focus({ preventScroll: true });
    previousModulesOpened.current = modulesOpened;
  }, [modulesOpened]);

  return (
    <PlanFlipCard>
      <PlanFlipInner $flipped={modulesOpened}>
        <PlanFlipFace $selected={isSelected} inert={modulesOpened} aria-hidden={modulesOpened}>
          <PlanSelection type="button" aria-label={`Plano ${plan.name}`} aria-describedby={`${modulesId}-price${plan.description ? ` ${modulesId}-description` : ""}`} aria-pressed={isSelected} onClick={onClick}>
            <PlanHeading>
              <strong>{plan.name}</strong>
              <PlanSelectionIndicator $selected={isSelected} aria-hidden="true">
                {isSelected && <CheckOutlined />}
              </PlanSelectionIndicator>
            </PlanHeading>
            {plan.description && <PlanDescription id={`${modulesId}-description`}>{plan.description}</PlanDescription>}
            <PlanPrice id={`${modulesId}-price`}>
              <ReferralPlanPrice plan={plan} />
            </PlanPrice>
          </PlanSelection>
          <ModuleActions>
            <Typography.Text type="secondary">
              {modules.length} {modules.length === 1 ? "módulo incluso" : "módulos inclusos"}
            </Typography.Text>
            <Button
              ref={modulesButtonRef}
              type="link"
              icon={<LuFolders aria-hidden />}
              aria-expanded={modulesOpened}
              aria-controls={modulesId}
              aria-label={`Ver módulos de ${plan.name}`}
              onClick={() => setModulesOpened(true)}
            >
              Ver módulos
            </Button>
          </ModuleActions>
        </PlanFlipFace>
        <PlanFlipFace $selected={isSelected} $back inert={!modulesOpened} aria-hidden={!modulesOpened}>
          <PlanHeading as="h3" style={{ margin: 0 }}>
            <strong>{plan.name}</strong>
            <PlanSelectionIndicator $selected={isSelected} aria-hidden="true">
              {isSelected && <CheckOutlined />}
            </PlanSelectionIndicator>
          </PlanHeading>
          <PlansModules as="section" id={modulesId} aria-label={`Módulos de ${plan.name}`}>
            <Typography.Text strong>Módulos inclusos</Typography.Text>
            {modules.length ? <ul>{modules.map(module => <li key={module.id}>{module.name}</li>)}</ul>
              : <Typography.Text type="secondary">Este plano não possui módulos informados.</Typography.Text>}
          </PlansModules>
          <ModuleActions>
            <Typography.Text type="secondary">
              {modules.length} {modules.length === 1 ? "módulo incluso" : "módulos inclusos"}
            </Typography.Text>
            <Button ref={returnButtonRef} type="link" icon={<ArrowLeftOutlined aria-hidden="true" />} onClick={() => setModulesOpened(false)}>
              Voltar
            </Button>
          </ModuleActions>
        </PlanFlipFace>
      </PlanFlipInner>
    </PlanFlipCard>
  );
}

export function CycleSelector({ plan, selectedCycle, onCycleChange, id, disabled = false }: {
  plan: NewPlanModel;
  selectedCycle: string;
  onCycleChange: (cycle: string) => void;
  id?: string;
  disabled?: boolean;
}) {
  const referral = useReferralPlans();
  const preview = referral?.valid ? referral.preview : undefined;
  const cycles = getPlanRecurringPrices(plan).map(cycle => {
    const offer = previewPrice(preview, plan.id, cycle.value);
    const finalAmount = offer ? offer.finalAmountCents / 100 : cycle.amount;
    const monthlyAmount = Math.round(Math.round(finalAmount * 100) / cycle.months) / 100;
    const monthlyPrice = monthlyAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    const original = offer ? `${(offer.baseAmountCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} → ` : "";
    const status = preview && !offer ? " — valor regular, sem desconto neste ciclo" : "";
    return { ...cycle, displayLabel: `${cycle.label} — ${original}${formatCycleCharge(cycle.value, finalAmount)} — ${monthlyPrice}/mês${status}` };
  });

  return (
    <CycleSelect
      id={id}
      aria-label="Ciclo da assinatura"
      value={cycles.some(cycle => cycle.value === selectedCycle) ? selectedCycle : undefined}
      onChange={onCycleChange}
      disabled={disabled || !cycles.length}
      placeholder={cycles.length ? "Selecione uma assinatura" : "Nenhum ciclo disponível"}
      optionLabelProp="label"
      virtual={false}
      dropdownRender={menu => <CyclePopup>{menu}</CyclePopup>}
      options={cycles.map(cycle => ({
        value: cycle.value,
        label: <span>{cycle.displayLabel}{cycle.value === "YEARLY" && <> <StarFilled aria-hidden style={{ color: "#d48806" }} /></>}</span>,
      }))}
      optionRender={option => (
        <CycleOption>
          <span>{cycles.find(cycle => cycle.value === option.value)?.displayLabel ?? option.label}</span>
          {option.value === "YEARLY" && <small><StarFilled aria-hidden style={{ color: "#d48806" }} /> Custo-benefício</small>}
        </CycleOption>
      )}
    />
  );
}
