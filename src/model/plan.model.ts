export interface PlanModel {
  allow_lifetime: boolean;
  billingRecurrencyType: string;
  annual_value: number | null;
  created_at: string;
  created_by: string;
  description: string;
  duration_days: number | null;
  id: string;
  is_free: boolean;
  lifetime_value: number | null;
  month_value?: number;
  billingValue?: number;
  name: string;
  quarterly_value: number | null;
  question_limit: number | null;
  semiannual_value: number | null;
  status: string | null;
  unique_value: string | null;
  updated_at: string;
  updated_by: string;
  subscriptionPlan?: {
    name: string;
    description: string;
  }
}
