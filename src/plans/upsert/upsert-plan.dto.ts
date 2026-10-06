export interface UpsertPlanDTO {
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
