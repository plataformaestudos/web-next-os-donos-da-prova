import {
  loadChildrenModules,
  queryModules,
} from "@/modules/tree/load-modules.action";

import { PageLayout } from "@/ui/page-layout/page-layout.component";
import { UpsertPlanForm } from "@/plans/upsert/upsert-plan-form.component";
import { UpsertPlanFormSubmitButton } from "@/plans/upsert/upsert-plan-form-submit-button.component";
import { UpsertPlanProvider } from "@/plans/upsert/upsert-plan.context";

export default async function NewPlanPage() {
  const rootModules = await queryModules();

  return (
    <UpsertPlanProvider>
      <PageLayout
        title="Novo plano"
        backHref="/plans"
        actions={[<UpsertPlanFormSubmitButton key="save" />]}
      >
        <UpsertPlanForm
          modules={{ data: rootModules, loadData: loadChildrenModules }}
        />
      </PageLayout>
    </UpsertPlanProvider>
  );
}
