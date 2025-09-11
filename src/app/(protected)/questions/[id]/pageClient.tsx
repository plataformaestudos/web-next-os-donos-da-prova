"use client";

import * as Styled from "./page.style";
import { Button, Divider } from "antd";
import Link from "next/link";
import { LuArrowLeft } from "react-icons/lu";
import { FullPageLoading } from "@/ui/loading/full-page-loading";
import { QuestionTitle } from "@/questions/question-title.component";
import { PreviewOrEditQuestion } from "@/questions/preview-or-edit-question.component";
import { QuestionFormSubmitButton } from "@/questions/question-form-submit-button.component";
import { UpserQuestionProvider } from "@/questions/upsert/upsert-question.context";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import { Roles } from "@/util/roles";

export function EditQuestionPageClient({ question }: { question: any }) {
  const { user, loading, allowed } = useAuthGuard({
    requireRoles: [Roles.ADMIN, Roles.COLLABORATOR],
  });

if (loading) return <FullPageLoading />;

  if (!allowed) return null; // usuário não autorizado

  return (
    <UpserQuestionProvider>
      <Styled.QuestionContainer>
        <Styled.QuestionHeader>
          <Styled.QuestionTitle>
            <Link href="/questions">
              <Button shape="circle" icon={<LuArrowLeft />} />
            </Link>
            <QuestionTitle id={question.id} />
          </Styled.QuestionTitle>
          <QuestionFormSubmitButton />
        </Styled.QuestionHeader>
        <Divider />
        <PreviewOrEditQuestion
          question={{
            id: question.id,
            type: question.type,
            text: question.text,
            comment: question.comment,
            alternatives: question.alternatives,
            modules: question.modules,
          }}
        />
      </Styled.QuestionContainer>
    </UpserQuestionProvider>
  );
}
