import SignupSteps from "@/signup/signup.component";
import { createClient } from "@/util/supabase/server";

export default async function SignupPage() {
  const client = await createClient();
  const { data: plans } = await client.from("subscription_plans").select(
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
