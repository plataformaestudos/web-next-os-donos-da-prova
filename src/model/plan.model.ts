export interface PlanModel {
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
    yearlyValue: number | null;
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
