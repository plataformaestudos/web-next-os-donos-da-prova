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
  lifetimeValue?: number;
  modules: string[];
}
