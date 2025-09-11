// EditPlanPage.tsx (Server Component)
import { createClient } from "@/util/supabase/server";
import { queryModules } from "@/modules/tree/load-modules.action";
import { EditPlanPageClient } from "./pageClient";

export default async function EditPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

  // Busca módulos raiz
  const rootModules = await queryModules();

  // Busca plano
  const { data: plan } = await supabase
    .from("subscription_plans")
    .select(
      `
      id,
      name,
      description,
      monthValue:month_value,
      quarterlyValue:quarterly_value,
      semiannualValue:semiannual_value,
      yearlyValue: annual_value,
      lifetimeValue:lifetime_value,
      isFree:is_free,
      durationDays:duration_days,
      questionLimit:question_limit,
      modules:plans_modules(module_id)
    `
    )
    .eq("id", id)
    .single()
    .then((response) => {
      if (response.data) {
        response.data.modules = response.data.modules.map((m) => m.module_id);
      }
      return response;
    });

  if (!plan) return null;

  return <EditPlanPageClient plan={plan} rootModules={rootModules} />;
}
