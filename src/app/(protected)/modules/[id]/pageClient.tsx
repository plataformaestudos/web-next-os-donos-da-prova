"use client";

import { PageLayout } from "@/ui/page-layout/page-layout.component";
import { ModuleForm } from "@/modules/module-form.component";
import { ModuleFormSubmitButton } from "@/modules/module-form-submit-button.component";
import { UpdateModuleProvider } from "@/modules/update/update-module.context";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import { Roles } from "@/util/roles";
import { FullPageLoading } from "@/ui/loading/full-page-loading";
import { ModuleEntitie, ModuleModel, ModuleViewModel } from "@/model/module.model";
interface EditModulePageClientProps {
    module: { id: string; name: string, parent_module_id: string | null },
    allModules?: ModuleEntitie[],
    childrenModules: {
        parentModuleId: string | null;
        key: string;
        title: string;
        children?: ModuleViewModel[] | undefined;
        id: string;
        name: string;
        numberQuestions: number;
        treeCode: string;
        isLeaf?: boolean;
        childModules?: ModuleModel[];
        
    }[]
}
export function EditModulePageClient({
    module,
    childrenModules,
    allModules,
}: EditModulePageClientProps) {
    const { loading, allowed } = useAuthGuard({
        requireRoles: [Roles.ADMIN, Roles.COLLABORATOR],
    });

    if (loading) return <FullPageLoading />;

    if (!allowed) return null;

    return (
        <UpdateModuleProvider>
            <PageLayout
                backHref="/modules"
                title={module.name}
                actions={[<ModuleFormSubmitButton key="update-module" />]}
            >
                <ModuleForm
                    id={module.id}
                    name={module.name}
                    parentModuleId={module.parent_module_id}
                    childModules={childrenModules}
                    allModules={allModules || []}
                />
            </PageLayout>
        </UpdateModuleProvider>
    );
}
