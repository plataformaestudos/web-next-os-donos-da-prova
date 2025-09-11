"use client";

import { PageLayout } from "@/ui/page-layout/page-layout.component";
import { ModulesTree } from "@/modules/tree/modules-tree.component";
import { CreateModuleButton } from "@/modules/create/create-module-button.component";
import { SearchModules } from "@/modules/search-modules.component";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import { Roles } from "@/util/roles";
import { loadChildrenModules } from "@/modules/tree/load-modules.action";
import { FullPageLoading } from "@/ui/loading/full-page-loading";
import { ModuleViewModel } from "@/model/module.model";

export function ModulesPageClient({ rootModules }: { rootModules: ModuleViewModel[] }) {
  const {  loading, allowed } = useAuthGuard({
    requireRoles: [Roles.ADMIN, Roles.COLLABORATOR],
  });

if (loading) return <FullPageLoading />;

  if (!allowed) return null;

  return (
    <PageLayout
      title="Módulos"
      actions={[<SearchModules key="search" />, <CreateModuleButton key="create" />]}
    >
      {rootModules && (
        <ModulesTree modules={rootModules} loadData={loadChildrenModules} />
      )}
    </PageLayout>
  );
}
