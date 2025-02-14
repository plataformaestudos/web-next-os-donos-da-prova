import { Button, Input } from "antd";

import { ModuleForm } from "@/modules/module-form.component";
import { ModulesTree } from "@/modules/modules-tree.component";
import { PageLayout } from "@/ui/page-layout/page-layout.component";
import { createClient } from "@/util/supabase/server";

export default async function EditModulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { id } = await params;

  const { data } = await supabase
    .from("modules")
    .select(
      `
      id,
      name
    `
    )
    .eq("id", id);

  const { data: subModules } = await supabase
    .from("modules_submodules")
    .select(
      `
      details:modules!module_id (id, name)
    `
    )
    .eq("parent_module_id", id);

  const _module = data?.[0];

  const childModules = subModules
    ?.flatMap((result) => result.details)
    .map((details) => ({
      key: details.id,
      title: details.name,
    }));

  if (!_module) {
    return null;
  }

  return (
    <PageLayout
      backHref="/modules"
      title={_module.name}
      actions={[
        <Button key="save" type="primary" size="large">
          Salvar
        </Button>,
      ]}
    >
      <ModuleForm
        id={_module.id}
        name={_module.name}
        childModules={childModules || []}
      />
    </PageLayout>
  );
}
