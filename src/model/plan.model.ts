export interface MyPlanModel {
  billingRecurrencyType: string;
  billingValue: number | null;
  created_at: string;
  created_by: string;
  description: string;
  id: string;
  name: string;
  question_limit: number | null;
  status: string | null;
  updated_at: string;
  updated_by: string;
  subscriptionPlan?: {
    name: string;
    description: string;
    questionLimit: number | null;
    monthValue: number | null;
    quarterlyValue: number | null;
    semiannualValue: number | null;
    annualValue: number | null;
    lifetimeValue: number | null;
    durationDays: number | null;
    isFree: boolean;
    allowLifetime: boolean;
  };
  modules?: {
    id: string;
    name: string;
  }[] | null;
}


export interface NewPlanModel {
  allowLifetime: boolean;
  annualValue: number | null;
  description: string;
  id: string;
  lifetimeValue: number | null;
  modules?: {
    id: string;
    name: string;
  }[] | null;
  monthValue: number | null;
  name: string;
  quarterlyValue: number | null;
  semiannualValue: number | null;
  uniqueValue: number | null;
  questionLimit: number | null;
  durationDays: number | null;
  isFree: boolean;
}