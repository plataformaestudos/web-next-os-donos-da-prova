// NewQuestionBookPage.tsx (Server Component)
import { createClient } from "@/util/supabase/server";
import { loadUserPlanModules } from "@/modules/tree/load-modules.action";
import { NewQuestionBookPageClient } from "./pageClient";

type SearchParams = Promise<{ pasta: string }>



export default async function NewQuestionBookPage(props: { searchParams: SearchParams }) {
  const supabase = await createClient();
  const { pasta } = await props.searchParams;
  const folderId = pasta

  const userPlanModules = await loadUserPlanModules();
  
  const { data: folders } = await supabase
    .from("book_folders")
    .select("id, name, questionBooks:question_books(id, name)");

  return (
    <NewQuestionBookPageClient
      folderId={folderId || undefined}
      folders={folders || []}
      userPlanModules={userPlanModules || []}
    />
  );
}
