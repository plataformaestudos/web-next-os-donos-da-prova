export interface UpsertPlanDTO {
  upgradePlanId?: string | null;
  upgradeCycle?: "MONTHLY" | "QUARTERLY" | "SEMIANNUALLY" | "YEARLY" | null;
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

export interface UpgradePlanOption {
  id: string;
  name: string;
  monthValue: number | null;
  quarterlyValue: number | null;
  semiannualValue: number | null;
  annualValue: number | null;
}
