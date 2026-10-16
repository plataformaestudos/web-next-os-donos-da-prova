import type { NewPlanModel } from '@/model/plan.model';
import { getPlanCardPrice, getPlanRecurringPrices } from '@/plans/plan-price-display';
import type { StudyAccess } from './study-access.model';

/** The authenticated catalog already filters active plans available to this user. */
export function selectUpgradeOffer(plans: NewPlanModel[], preference?: StudyAccess['upgradeOffer']): NewPlanModel | null {
  const eligible = plans.filter(plan => !plan.isFree && getPlanRecurringPrices(plan).length > 0);
  if (preference) {
    const selected = eligible.find(plan => plan.id === preference.planId &&
      getPlanRecurringPrices(plan).some(price => price.value === preference.cycle));
    return selected ? { ...selected, cardDisplayCycle: preference.cycle, cardDisplayMode: 'CYCLE_TOTAL' } : null;
  }
  const annual = eligible.find(plan => getPlanRecurringPrices(plan).some(price => price.value === 'YEARLY'));
  const plan = annual ?? eligible[0];
  if (!plan) return null;
  const cycle = annual ? 'YEARLY' : getPlanCardPrice(plan)?.cycle;
  return { ...plan, cardDisplayCycle: cycle, cardDisplayMode: 'CYCLE_TOTAL' };
}

export function formatUpgradeReset(dailyResetAt: string | null): string | null {
  if (!dailyResetAt || !Number.isFinite(Date.parse(dailyResetAt))) return null;
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Sao_Paulo',
  }).format(new Date(dailyResetAt));
}
