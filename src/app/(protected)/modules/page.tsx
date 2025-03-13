import {
  loadChildrenModules,
  queryModules,
} from "@/modules/tree/load-modules.action";

import { CreateModuleButton } from "@/modules/create/create-module-button.component";
import { ModulesTree } from "@/modules/tree/modules-tree.component";
import { PageLayout } from "@/ui/page-layout/page-layout.component";
import { SearchModules } from "@/modules/search-modules.component";

export default async function ModulesPage({
  searchParams,
}: {
  searchParams: Promise<{
    nome: string;
  }>;
}) {
  const { nome: query } = await searchParams;
  const rootModules = await queryModules(query);

  return (
    <PageLayout
      title="Módulos"
      actions={[
        <SearchModules key="search" />,
        <CreateModuleButton key="create" />,
      ]}
    >
      {rootModules && (
        <ModulesTree modules={rootModules} loadData={loadChildrenModules} />
      )}
    </PageLayout>
  );
}
