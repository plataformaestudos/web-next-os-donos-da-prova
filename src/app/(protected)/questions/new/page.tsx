// NewQuestionPage.tsx (Server Component)
import { createClient } from "@/util/supabase/server";
import { NewQuestionPageClient } from "./pageClient";

export default async function NewQuestionPage({ searchParams }: { searchParams: { modulos?: string } }) {
  const supabase = await createClient();
  const modulesParam = searchParams.modulos;

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
