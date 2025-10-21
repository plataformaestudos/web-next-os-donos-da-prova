"use client";

import { PageLayout } from "@/ui/page-layout/page-layout.component";
import { CreateQuestionBookSubmitButton } from "@/question-books/create/create-question-book-submit-button.component";
import { QuestionBookForm } from "@/question-books/create/question-book-form.component";
import { CreateQuestionProvider } from "@/question-books/create/create-question-book.context";
import { loadChildrenModules } from "@/modules/tree/load-modules.action";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import { Roles } from "@/util/roles";
import { FullPageLoading } from "@/ui/loading/full-page-loading";
import { ModuleViewModel } from "@/model/module.model";
interface FoldersProps {
  id: string;
  name: string;
  questionBooks: {
    id: string;
    name: string;
    createdAt: string;
    isPublic: boolean;
    favorite: boolean;
    userId: string;
    folderId?: string;
    questionsCount: number;
    nrOfAnsweredQuestions: number;
    percentAnswered: number;
  }[];
  nrOfQuestionBooks: number;
}
export function NewQuestionBookPageClient({
    folderId,
    folders,
    userPlanModules,
  }: {
    folderId: string | undefined;
    folders: FoldersProps[];
    userPlanModules: ModuleViewModel[];
  }) {
  const { allowed, loading } = useAuthGuard({
    requireRoles: [Roles.ADMIN, Roles.STUDENT],
  });

  if (loading) return <FullPageLoading />;

  if (!allowed) return null;

  const backHref = folderId ? `/question-books?pasta=${folderId}` : "/question-books";

  return (
    <CreateQuestionProvider>
      <PageLayout
        title="Novo caderno"
        backHref={backHref}
        actions={[<CreateQuestionBookSubmitButton key="save" />]}
      >
        <QuestionBookForm
          questionBook={{ folderId }}
          folders={folders}
          modules={{ data: userPlanModules, loadData: loadChildrenModules }}
        />
      </PageLayout>
    </CreateQuestionProvider>
  );
}
