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
  yearlyValue?: number;
  lifetimeValue?: number;
  modules: string[];
}
