import { Button, Input } from "antd";

import { CreateModuleButton } from "@/modules/create/create-module-button.component";
import Link from "next/link";
import { ModulesTree } from "@/modules/modules-tree.component";
import { PageLayout } from "@/ui/page-layout/page-layout.component";
import { SearchOutlined } from "@ant-design/icons";
import { createClient } from "@/util/supabase/server";

export default async function ModulesPage() {
  const supabase = await createClient();

  const { data: modules } = await supabase.from("modules").select(`
    id, name
  `);

  const { data: tree } = await supabase.from("modules_submodules").select(`
    *
  `);

  const parentModulesIds = tree?.map(
    ({ parent_module_id }) => parent_module_id
  );
  const nestedModulesIds = tree?.map(({ module_id }) => module_id);
  const rootModules = modules
    ?.filter(({ id }) => nestedModulesIds?.indexOf(id) === -1)
    .map((mod) => ({
      key: mod.id,
      title: mod.name,
    }));

  const modulesMap = modules
    ?.map((mod) => ({
      key: mod.id,
      title: mod.name,
    }))
    ?.reduce((acc, module) => {
      acc[module.key] = module;

      return acc;
    }, {} as any);

  const treeMap = tree?.reduce((acc, { module_id, parent_module_id }) => {
    if (!acc[parent_module_id]) {
      acc[parent_module_id] = [];
    }

    acc[parent_module_id].push({
      ...modulesMap[module_id],
      isLeaf: parentModulesIds?.indexOf(module_id) === -1,
    });

    return acc;
  }, {} as any);

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
        <ModulesTree
          modules={rootModules}
          loadData={async function loadData(key: string) {
            "use server";

            return Promise.resolve(treeMap[key]);
          }}
        />
      )}
    </PageLayout>
  );
}
