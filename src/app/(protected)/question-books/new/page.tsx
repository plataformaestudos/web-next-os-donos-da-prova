import {
  loadChildrenModules,
  queryModules,
} from "@/modules/tree/load-modules.action";

import { CreateQuestionBookSubmitButton } from "@/question-books/create/create-question-book-submit-button.component";
import { CreateQuestionProvider } from "@/question-books/create/create-question-book.context";
import { PageLayout } from "@/ui/page-layout/page-layout.component";
import { QuestionBookForm } from "@/question-books/create/question-book-form.component";
import { createClient } from "@/util/supabase/server";

export default async function NewQuestionBook() {
  const supabase = await createClient();

  const rootModules = await queryModules();
  const { data: folders } = await supabase
    .from("book_folders")
    .select("id, name, questionBooks:question_books(id, name)");

  return (
    <CreateQuestionProvider>
      <PageLayout
        title="Novo caderno"
        backHref="/question-books"
        actions={[<CreateQuestionBookSubmitButton key="save" />]}
      >
        {folders && (
          <QuestionBookForm
            folders={folders}
            modules={{ data: rootModules, loadData: loadChildrenModules }}
          />
        )}
      </PageLayout>
    </CreateQuestionProvider>
  );
}
