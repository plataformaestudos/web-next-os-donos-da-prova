// EditModulePage.tsx (Server Component)
import { createClient } from "@/util/supabase/server";
import { loadChildrenModules } from "@/modules/tree/load-modules.action";
import { EditModulePageClient } from "./pageClient";
type Params = Promise<{ id: string }>


export default async function EditModulePage(props: { params: Params }) {
  const params = await props.params;
  const { id } = params;

  const supabase = await createClient();
  const { data } = await supabase
    .from("modules")
    .select(`
      id,
      name
    `)
    .eq("id", id)
    .limit(1)
    .single();

  if (!data) return null;

  const childrenModules = await loadChildrenModules(data.id);

  return <EditModulePageClient module={data} childrenModules={childrenModules || []} />;
}
