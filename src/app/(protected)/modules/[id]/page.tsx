import { Button } from "antd";
import { ModuleForm } from "@/modules/module-form.component";
import { PageLayout } from "@/ui/page-layout/page-layout.component";
import { createClient } from "@/util/supabase/server";
import { loadChildrenModules } from "@/modules/load-modules.action";

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
    .eq("id", id)
    .limit(1)
    .single();

  if (!data) {
    return null;
  }

  const childrenModules = await loadChildrenModules(data.id);

  return (
    <PageLayout
      backHref="/modules"
      title={data.name}
      actions={[
        <Button key="save" type="primary" size="large">
          Salvar
        </Button>,
      ]}
    >
      <ModuleForm
        id={data.id}
        name={data.name}
        childModules={childrenModules || []}
      />
    </PageLayout>
  );
}
