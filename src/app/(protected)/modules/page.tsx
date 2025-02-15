import {
  loadChildrenModules,
  loadRootModules,
} from "@/modules/load-modules.action";

import { CreateModuleButton } from "@/modules/create/create-module-button.component";
import { Input } from "antd";
import { ModulesTree } from "@/modules/modules-tree.component";
import { PageLayout } from "@/ui/page-layout/page-layout.component";
import { SearchOutlined } from "@ant-design/icons";

export default async function ModulesPage() {
  const rootModules = await loadRootModules();

  return (
    <PageLayout
      title="Módulos"
      actions={[
        <Input
          key="search-module"
          prefix={<SearchOutlined />}
          placeholder="Buscar módulo"
          size="large"
          allowClear
          style={{
            minWidth: 300,
          }}
        />,
        <CreateModuleButton key="create" />,
      ]}
    >
      {rootModules && (
        <ModulesTree modules={rootModules} loadData={loadChildrenModules} />
      )}
    </PageLayout>
  );
}
