import { NewPlanModel } from '@/model/plan.model';

export type PlanDisplayCycle = 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUALLY' | 'YEARLY';
export type PlanDisplayMode = 'CYCLE_TOTAL' | 'MONTHLY_EQUIVALENT';

export const recurringCycles: { value: PlanDisplayCycle; label: string; months: number }[] = [
  { value: 'MONTHLY', label: 'Mensal', months: 1 },
  { value: 'QUARTERLY', label: 'Trimestral', months: 3 },
  { value: 'SEMIANNUALLY', label: 'Semestral', months: 6 },
  { value: 'YEARLY', label: 'Anual', months: 12 },
];

const currency = (amount: number) => new Intl.NumberFormat('pt-BR', {
  style: 'currency', currency: 'BRL',
}).format(amount);

export function getPlanRecurringPrices(plan: Pick<NewPlanModel,
  'monthValue' | 'quarterlyValue' | 'semiannualValue' | 'annualValue'>) {
  const amountByCycle: Record<PlanDisplayCycle, number | null> = {
    MONTHLY: plan.monthValue,
    QUARTERLY: plan.quarterlyValue,
    SEMIANNUALLY: plan.semiannualValue,
    YEARLY: plan.annualValue,
  };
  return recurringCycles.flatMap(cycle => {
    const amount = amountByCycle[cycle.value];
    return amount != null && Number.isFinite(Number(amount)) && Number(amount) > 0
      ? [{ ...cycle, amount: Number(amount) }]
      : [];
  });
}

export function getPlanCardPrice(plan: Pick<NewPlanModel,
  'monthValue' | 'quarterlyValue' | 'semiannualValue' | 'annualValue' | 'cardDisplayCycle' | 'cardDisplayMode'>, totalCents?: number) {
  const prices = getPlanRecurringPrices(plan);
  const displayed = prices.find(price => price.value === plan.cardDisplayCycle) || prices[0];
  if (!displayed) return null;

  const amountCents = totalCents ?? Math.round(displayed.amount * 100);
  const total = amountCents / 100;
  if (plan.cardDisplayMode === 'CYCLE_TOTAL' || displayed.months === 1) {
    const cadence = displayed.months === 1 ? 'todo mês' : `a cada ${displayed.months} meses`;
    return {
      cycle: displayed.value,
      amount: total,
      headline: currency(total),
      detail: `cobrados ${cadence}`,
    };
  }

  const monthlyCents = Math.round(amountCents / displayed.months);
  return {
    cycle: displayed.value,
    amount: monthlyCents / 100,
    headline: `${currency(monthlyCents / 100)}/mês`,
    detail: `${currency(total)} cobrados a cada ${displayed.months} meses`,
  };
}

export function formatCycleCharge(cycle: string, amount: number): string {
  const cadence = recurringCycles.find(item => item.value === cycle);
  if (!cadence) return "Ciclo indisponível para contratação";
  return cadence.months === 1
    ? `${currency(amount)} cobrados todo mês`
    : `${currency(amount)} cobrados a cada ${cadence.months} meses`;
}

export function getBestValueCycle(cycles: { value: string; price: number }[]): string | undefined {
  const recurring = cycles.flatMap(cycle => {
    const definition = recurringCycles.find(item => item.value === cycle.value);
    return definition ? [{ ...cycle, months: definition.months }] : [];
  });
  if (recurring.length < 2) return undefined;
  return recurring.reduce((best, current) =>
    Math.round(current.price * 100 / current.months) < Math.round(best.price * 100 / best.months)
      ? current : best,
  ).value;
}
