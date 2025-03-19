import {
  PostgrestResponse,
  PostgrestSingleResponse,
} from "@supabase/supabase-js";

import SignupSteps from "@/signup/signup.component";
import { UpsertPlanDTO } from "@/plans/upsert/upsert-plan.dto";
import { createClient } from "@/util/supabase/server";

export default async function SignupPage() {
  const client = await createClient();
  const { data: plans, error } = await client.from("subscription_plans").select(
    `
    id,
    name,
    description,
    price:month_value,
    modules:plans_modules(...modules(name))
  `
  );

  if (!plans) {
    return null;
  }

  return <SignupSteps plans={plans} />;
}
