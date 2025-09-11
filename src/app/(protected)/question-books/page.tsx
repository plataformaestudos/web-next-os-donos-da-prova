import { createClient } from "@/util/supabase/server";
import { QuestionBooksClient } from "./pageClient";
type SearchParams = Promise<{ pasta: string }>
export default async function QuestionBooks(props: { searchParams: SearchParams }) {
  const { pasta } = await props.searchParams;
  const supabase = await createClient();

  // Busca pastas e question books
  const { data } = await supabase
    .from("book_folders")
    .select("id, name, questionBooks:question_books(id, name, folder_id)");

  const folders = data?.map((folder) => ({
    id: folder.id,
    name: folder.name,
    questionBooks: folder.questionBooks,
    nrOfQuestionBooks: folder.questionBooks.length,
  }));

  return (
    <QuestionBooksClient
      initialFolders={folders || []}
      folderId={pasta}
    />
  );
}
