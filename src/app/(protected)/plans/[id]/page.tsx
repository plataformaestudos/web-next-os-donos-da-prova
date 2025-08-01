import { ModuleModel, ModuleViewModel } from "@/model/module.model";
import { Roles, verify } from "@/util/roles";
import {
  loadChildrenModules,
  queryModules,
} from "@/modules/tree/load-modules.action";
import {
  mergeModulesTree,
  moduleModelToViewModelAdapter,
} from "@/modules/modules.util";

import { CACHE_TAGS } from "@/util/cache-tags.util";
import HttpClient from "@/util/http-client/fetch-server.util";
import { PageLayout } from "@/ui/page-layout/page-layout.component";
import { PostgrestSingleResponse } from "@supabase/supabase-js";
import { ResponseModel } from "@/model/common.model";
import { UpsertPlanDTO } from "@/plans/upsert/upsert-plan.dto";
import { UpsertPlanForm } from "@/plans/upsert/upsert-plan-form.component";
import { UpsertPlanFormSubmitButton } from "@/plans/upsert/upsert-plan-form-submit-button.component";
import { UpsertPlanProvider } from "@/plans/upsert/upsert-plan.context";
import { createClient } from "@/util/supabase/server";
import { redirect } from "next/navigation";

export default async function EditQuestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await verify([Roles.ADMIN]))) {
    return redirect("/");
  }

  const supabase = await createClient();
  const { id } = await params;

  const rootModules = await queryModules();

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
        response.data.modules = response.data.modules.map(
          (module) => module.module_id
        );
      }
      return response as PostgrestSingleResponse<UpsertPlanDTO>;
    });

  if (!plan) {
    return null;
  }

  let planModules: ModuleViewModel[] = [];

  if (plan.modules.length > 0) {
    planModules = await HttpClient.fetch<ResponseModel<ModuleModel[]>>(
      `/modules/tree_by_ids?ids=${plan.modules.join(
        ","
      )}&show_tree_parents=true`,
      {
        method: "GET",
        next: {
          tags: [CACHE_TAGS.MODULES],
        },
      }
    ).then((r) => r.data?.map(moduleModelToViewModelAdapter) ?? []);
  }

  return (
    <UpsertPlanProvider>
      <PageLayout
        title="Editar plano"
        backHref="/plans"
        actions={[<UpsertPlanFormSubmitButton key="save" />]}
      >
        <UpsertPlanForm
          plan={plan}
          modules={{
            data: mergeModulesTree(rootModules, planModules),
            loadData: loadChildrenModules,
          }}
        />
      </PageLayout>
    </UpsertPlanProvider>
  );
}
