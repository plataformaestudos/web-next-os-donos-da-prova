"use client";

import { PageLayout } from "@/ui/page-layout/page-layout.component";
import { PlanFormValues, UpsertPlanForm } from "@/plans/upsert/upsert-plan-form.component";
import { UpsertPlanFormSubmitButton } from "@/plans/upsert/upsert-plan-form-submit-button.component";
import { UpsertPlanProvider } from "@/plans/upsert/upsert-plan.context";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import { Roles } from "@/util/roles";
import { mergeModulesTree, moduleModelToViewModelAdapter } from "@/modules/modules.util";
import { CACHE_TAGS } from "@/util/cache-tags.util";
import { loadChildrenModules } from "@/modules/tree/load-modules.action";
import { ModuleViewModel, ModuleModel } from "@/model/module.model";
import HttpClient from "@/util/http-client/fetch-client.util";
import React from "react";
import { FullPageLoading } from "@/ui/loading/full-page-loading";

export function EditPlanPageClient({ plan, rootModules }: { plan: PlanFormValues; rootModules: ModuleViewModel[] }) {
  const { loading, allowed } = useAuthGuard({ requireRoles: [Roles.ADMIN] });

  const [planModules, setPlanModules] = React.useState<ModuleViewModel[]>([]);


  React.useEffect(() => {
    if (plan.modules.length > 0) {
      HttpClient.fetch<{ data: ModuleModel[] }>(
        `/modules/tree_by_ids?ids=${plan.modules.join(",")}&show_tree_parents=true`,
        {
          method: "GET",
          next: { tags: [CACHE_TAGS.MODULES] },
        }
      )
        .then((r) => setPlanModules(r.data?.map(moduleModelToViewModelAdapter) ?? []))
        .catch(() => setPlanModules([]));
    }
  }, [plan.modules]);

  if (loading) return <FullPageLoading />;

  if (!allowed) return null;

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
