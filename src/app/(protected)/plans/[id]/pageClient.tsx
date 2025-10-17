"use client";

import { PageLayout } from "@/ui/page-layout/page-layout.component";
import { PlanFormValues, UpsertPlanForm } from "@/plans/upsert/upsert-plan-form.component";
import { UpsertPlanFormSubmitButton } from "@/plans/upsert/upsert-plan-form-submit-button.component";
import { UpsertPlanProvider } from "@/plans/upsert/upsert-plan.context";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import { Roles } from "@/util/roles";
import { moduleModelToViewModelAdapter } from "@/modules/modules.util";
import { CACHE_TAGS } from "@/util/cache-tags.util";
import { loadChildrenModules } from "@/modules/tree/load-modules.action";
import { ModuleViewModel, ModuleModel } from "@/model/module.model";
import HttpClient from "@/util/http-client/fetch-client.util";
import React from "react";
import { FullPageLoading } from "@/ui/loading/full-page-loading";

export function EditPlanPageClient({ plan }: { plan: PlanFormValues;  }) {
    const { loading, allowed } = useAuthGuard({ requireRoles: [Roles.ADMIN] });

    const [planModules, setPlanModules] = React.useState<ModuleViewModel[]>([]);

    const fetchModules = React.useCallback(async () => {
        if (plan.modules.length === 0) {
            setPlanModules([]);
            return;
        }

        try {
            const response = await HttpClient.fetch<{ data: ModuleModel[] }>(
                `/plans-modules/by-plan/${plan.id}`,
                {
                    method: "GET",
                    next: { tags: [CACHE_TAGS.MODULES] },
                },
                true 
            );

            const modules = response.data?.map(moduleModelToViewModelAdapter) ?? [];
            setPlanModules(modules);
        } catch (error) {
            console.error("Erro ao buscar módulos do plano:", error);
            setPlanModules([]);
        }
    }, [plan.id, plan.modules.length]);

    React.useEffect(() => {
        fetchModules();
    }, [fetchModules]);

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
                        data: planModules, // Usar apenas os módulos do plano (todos eles)
                        loadData: loadChildrenModules,
                    }}
                />
            </PageLayout>
        </UpsertPlanProvider>
    );
}
