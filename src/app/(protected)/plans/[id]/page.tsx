import {
  loadChildrenModules,
  queryModules,
} from "@/modules/tree/load-modules.action";

import { PageLayout } from "@/ui/page-layout/page-layout.component";
import { PostgrestSingleResponse } from "@supabase/supabase-js";
import { UpsertPlanDTO } from "@/plans/upsert/upsert-plan.dto";
import { UpsertPlanForm } from "@/plans/upsert/upsert-plan-form.component";
import { UpsertPlanFormSubmitButton } from "@/plans/upsert/upsert-plan-form-submit-button.component";
import { UpsertPlanProvider } from "@/plans/upsert/upsert-plan.context";
import { createClient } from "@/util/supabase/server";

export default async function EditQuestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { id } = await params;

  const rootModules = await queryModules();

  const { data: plan } = await supabase
    .from("subscription_plans")
    .select(
      `
      id,
      name,
      price,
      modules:plans_modules(module_id)
    `
    )
    .eq("id", id)
    .single()
    .then((response) => {
      if (response.data) {
        response.data.modules = response.data.modules.map(
          (module) => module.module_id
        );
      }
      return response as PostgrestSingleResponse<UpsertPlanDTO>;
    });

  if (!plan) {
    return null;
  }

  return (
    <UpsertPlanProvider>
      <PageLayout
        title="Plano"
        backHref="/plans"
        actions={[<UpsertPlanFormSubmitButton key="save" />]}
      >
        <UpsertPlanForm
          plan={plan}
          modules={{ data: rootModules, loadData: loadChildrenModules }}
        />
      </PageLayout>
    </UpsertPlanProvider>
  );
}
