// ModulesPage.tsx (Server Component)
import { queryModules } from "@/modules/tree/load-modules.action";
import { ModulesPageClient } from "./pageClient";

type Params = Promise<{ nome?: string }>

export default async function ModulesPage(props: { searchParams: Params }) {
  const searchParams = await props.searchParams;
  const { nome: query } = searchParams;
  const rootModules = await queryModules(query);

  return <ModulesPageClient rootModules={rootModules} />;
}
