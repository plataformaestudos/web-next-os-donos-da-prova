// NewQuestionBookPage.tsx (Server Component)
import { createClient } from "@/util/supabase/server";
import { queryModules, loadChildrenModules } from "@/modules/tree/load-modules.action";
import { NewQuestionBookPageClient } from "./pageClient";

export default async function NewQuestionBookPage({ searchParams }: { searchParams: { pasta?: string } }) {
  const supabase = await createClient();
  const folderId = searchParams.pasta;

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
