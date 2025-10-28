import { NewPlanModel } from "@/model/plan.model";
import SignupSteps from "@/signup/signup.component";
import { createClient } from "@/util/supabase/server";

export default async function SignupPage() {
  const client = await createClient();
  const { data: plans } = await client.from("subscription_plans").select(
    `
    id,
    name,
    description,
    monthValue:month_value,
    quarterlyValue:quarterly_value,
    semiannualValue:semiannual_value,
    annualValue: annual_value,
    lifetimeValue:lifetime_value,
    isFree:is_free,
    durationDays:duration_days,
    questionLimit:question_limit,
    allowLifetime:allow_lifetime,
    uniqueValue:unique_value,
    modules:plans_modules(...modules(id,name))
  `
  ).eq("status", "ACTIVE");

  if (!plans) {
    return null;
  }

  return <SignupSteps plans={plans as NewPlanModel[]} />;
}
