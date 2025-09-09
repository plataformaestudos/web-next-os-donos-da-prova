import { Breadcrumb, Button } from "antd";
import { Roles, verify } from "@/util/roles";

import { CreateFolderButton } from "@/question-books/create-folder/create-folder-button.component";
import Link from "next/link";
import { ListFolders } from "@/question-books/list-folders/list-folders.component";
import { ListQuestionBooks } from "@/question-books/list/list-question-books.component";
import { LuBook } from "react-icons/lu";
import { PageLayout } from "@/ui/page-layout/page-layout.component";
import { createClient } from "@/util/supabase/server";
import { redirect } from "next/navigation";

export default async function QuestionBooks({
  searchParams,
}: {
  searchParams: Promise<{
    pasta: string;
  }>;
}) {
  if (!(await verify([Roles.ADMIN, Roles.STUDENT]))) {
    console.log("aqui")
    return redirect("/");
  }

  let newQuestionBookURL = "/question-books/new";
  const { pasta: folderId } = await searchParams;

  const supabase = await createClient();

  const { data } = await supabase
    .from("book_folders")
    .select("id, name, questionBooks:question_books(id, name)");

  const folders = data?.map((folder) => ({
    id: folder.id,
    name: folder.name,
    nrOfQuestionBooks: folder.questionBooks.length,
  }));

  const breadcrumbItems = [
    {
      title: (<Link href="/question-books">Minhas pastas</Link>) as
        | React.JSX.Element
        | string,
    },
  ];

  const query = supabase.from("question_books").select("id, name, folder_id");

  if (folderId && folders) {
    newQuestionBookURL += `?pasta=${folderId}`;
    const folderName = folders.find((folder) => folder.id === folderId)?.name;

    if (folderName) {
      breadcrumbItems.push({
        title: folderName,
      });

      query.eq("folder_id", folderId);
    }
  }

  const { data: questionBooks } = await query;

  const folderlessQuestionBooks =
    questionBooks?.filter((qb) => qb.folder_id === null) ?? [];

  return (
    <PageLayout
      title="Cadernos de questões"
      actions={[
        <CreateFolderButton key="create-folder" />,
        <Link key="create-book" href={newQuestionBookURL}>
          <Button type="primary" size="large" icon={<LuBook />}>
            Criar caderno
          </Button>
        </Link>,
      ]}
    >
      <Breadcrumb style={{ marginBottom: 24 }} items={breadcrumbItems} />
      {folders && !folderId && <ListFolders folders={folders} />}
      {questionBooks && folderId && (
        <ListQuestionBooks questionBooks={questionBooks} />
      )}
      {folderlessQuestionBooks?.length > 0 && (
        <>
          <Breadcrumb
            style={{ margin: "24px 0" }}
            items={[
              {
                title: (<Link href="/question-books">Meus cadernos</Link>) as
                  | React.JSX.Element
                  | string,
              },
            ]}
          />
          {folderlessQuestionBooks && (
            <ListQuestionBooks questionBooks={folderlessQuestionBooks} />
          )}
        </>
      )}
    </PageLayout>
  );
}
