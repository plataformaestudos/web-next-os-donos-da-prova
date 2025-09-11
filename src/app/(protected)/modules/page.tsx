// ModulesPage.tsx (Server Component)
import { queryModules } from "@/modules/tree/load-modules.action";
import { ModulesPageClient } from "./pageClient";

export default async function ModulesPage({ searchParams }: any) {
  const { nome: query } = await searchParams;
  const rootModules = await queryModules(query);

  return <ModulesPageClient rootModules={rootModules} />;
}
