import { Roles, verify } from "@/util/roles";

import { ModuleForm } from "@/modules/module-form.component";
import { ModuleFormSubmitButton } from "@/modules/module-form-submit-button.component";
import { PageLayout } from "@/ui/page-layout/page-layout.component";
import { UpdateModuleProvider } from "@/modules/update/update-module.context";
import { createClient } from "@/util/supabase/server";
import { loadChildrenModules } from "@/modules/tree/load-modules.action";
import { redirect } from "next/navigation";

export default async function EditModulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await verify([Roles.ADMIN, Roles.COLLABORATOR]))) {
    return redirect("/");
  }

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
    <UpdateModuleProvider>
      <PageLayout
        backHref="/modules"
        title={data.name}
        actions={[<ModuleFormSubmitButton key="update-module" />]}
      >
        <ModuleForm
          id={data.id}
          name={data.name}
          childModules={childrenModules || []}
        />
      </PageLayout>
    </UpdateModuleProvider>
  );
}
