import {
  loadChildrenModules,
  queryModules,
} from "@/modules/tree/load-modules.action";

import { PageLayout } from "@/ui/page-layout/page-layout.component";
import { UpsertPlanForm } from "@/plans/upsert/upsert-plan-form.component";
import { UpsertPlanFormSubmitButton } from "@/plans/upsert/upsert-plan-form-submit-button.component";
import { UpsertPlanProvider } from "@/plans/upsert/upsert-plan.context";
import { loadUpgradePlanOptions } from "@/services/content-management.server";

export default async function NewPlanPage() {
  const [rootModules, upgradeOptions] = await Promise.all([queryModules(), loadUpgradePlanOptions()]);

  return (
    <UpsertPlanProvider>
      <PageLayout
        title="Novo plano"
        backHref="/plans"
        actions={[<UpsertPlanFormSubmitButton key="save" />]}
      >
        <UpsertPlanForm
          upgradeOptions={upgradeOptions}
          modules={{ data: rootModules, loadData: loadChildrenModules }}
        />
      </PageLayout>
    </UpsertPlanProvider>
  );
}
