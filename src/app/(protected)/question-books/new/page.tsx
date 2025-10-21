// NewQuestionBookPage.tsx (Server Component)
import { loadUserPlanModules } from "@/modules/tree/load-modules.action";
import { getBookFolders } from "../api";
import { NewQuestionBookPageClient } from "./pageClient";

type SearchParams = Promise<{ pasta: string }>



export default async function NewQuestionBookPage(props: { searchParams: SearchParams }) {
  const { pasta } = await props.searchParams;
  const folderId = pasta;

  const [userPlanModules, folders] = await Promise.all([
    loadUserPlanModules(),
    getBookFolders()
  ]);

  return (
    <NewQuestionBookPageClient
      folderId={folderId || undefined}
      folders={folders?.folders || []}
      userPlanModules={userPlanModules || []}
    />
  );
}
