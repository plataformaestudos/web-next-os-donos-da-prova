// NewQuestionBookPage.tsx (Server Component)
import { createClient } from "@/util/supabase/server";
import { queryModules } from "@/modules/tree/load-modules.action";
import { NewQuestionBookPageClient } from "./pageClient";

type SearchParams = Promise<{ pasta: string }>



export default async function NewQuestionBookPage(props: { searchParams: SearchParams }) {
  const supabase = await createClient();
  const { pasta } = await props.searchParams;
  const folderId = pasta

  const rootModules = await queryModules();

  const { data: folders } = await supabase
    .from("book_folders")
    .select("id, name, questionBooks:question_books(id, name)");

  return (
    <NewQuestionBookPageClient
      folderId={folderId || undefined}
      folders={folders || []}
      rootModules={rootModules || []}
    />
  );
}
