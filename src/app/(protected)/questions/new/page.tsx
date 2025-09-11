// NewQuestionPage.tsx (Server Component)
import { createClient } from "@/util/supabase/server";
import { NewQuestionPageClient } from "./pageClient";

type SearchParams = Promise<{ modulos?: string }>

export default async function NewQuestionPage(props: { searchParams: SearchParams }) {
  const supabase = await createClient();
  const {modulos} = await props.searchParams;
  const modulesParam = modulos;

  let defaultSelectedModules: { id: string; name: string }[] = [];

  if (modulesParam) {
    const { data } = await supabase
      .from("modules")
      .select("id, name")
      .in("id", modulesParam.split(","));
    if (data) defaultSelectedModules = data;
  }

  return <NewQuestionPageClient defaultSelectedModules={defaultSelectedModules} />;
}
