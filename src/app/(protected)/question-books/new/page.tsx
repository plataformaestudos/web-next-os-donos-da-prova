import { Roles, verify } from "@/util/roles";
import {
  loadChildrenModules,
  queryModules,
} from "@/modules/tree/load-modules.action";

import { CreateQuestionBookSubmitButton } from "@/question-books/create/create-question-book-submit-button.component";
import { CreateQuestionProvider } from "@/question-books/create/create-question-book.context";
import { PageLayout } from "@/ui/page-layout/page-layout.component";
import { QuestionBookForm } from "@/question-books/create/question-book-form.component";
import { createClient } from "@/util/supabase/server";
import { redirect } from "next/navigation";

export default async function NewQuestionBook({
  searchParams,
}: {
  searchParams: Promise<{
    pasta: string;
  }>;
}) {
  if (!(await verify([Roles.ADMIN, Roles.STUDENT]))) {
    return redirect("/");
  }

  let backHref = "/question-books";
  const { pasta: folderId } = await searchParams;
  if (folderId) {
    backHref += `?pasta=${folderId}`;
  }
  const supabase = await createClient();

  const rootModules = await queryModules();
  const { data: folders } = await supabase
    .from("book_folders")
    .select("id, name, questionBooks:question_books(id, name)");

  return (
    <CreateQuestionProvider>
      <PageLayout
        title="Novo caderno"
        backHref={backHref}
        actions={[<CreateQuestionBookSubmitButton key="save" />]}
      >
        {folders && (
          <QuestionBookForm
            questionBook={{ folderId }}
            folders={folders}
            modules={{ data: rootModules, loadData: loadChildrenModules }}
          />
        )}
      </PageLayout>
    </CreateQuestionProvider>
  );
}
