"use client";

import * as Styled from "./page.style";
import { Button, Divider } from "antd";
import Link from "next/link";
import { LuArrowLeft } from "react-icons/lu";

import { QuestionForm } from "@/questions/question-form.component";
import { QuestionFormSubmitButton } from "@/questions/question-form-submit-button.component";
import { UpserQuestionProvider } from "@/questions/upsert/upsert-question.context";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import { Roles } from "@/util/roles";
import { FullPageLoading } from "@/ui/loading/full-page-loading";
export function NewQuestionPageClient({
  defaultSelectedModule,
  urlBack
}: {
  defaultSelectedModule: { id: string; name: string } | undefined;
  urlBack: string;
}) {
  const { allowed, loading } = useAuthGuard({
    requireRoles: [Roles.ADMIN, Roles.COLLABORATOR],
  });

if (loading) return <FullPageLoading />;

  if (!allowed) return null;

  return (
    <UpserQuestionProvider>
      <Styled.QuestionContainer>
        <Styled.QuestionHeader>
          <Styled.QuestionTitleContainer>
            <Link href={urlBack}>
              <Button shape="circle" icon={<LuArrowLeft />} />
            </Link>
            <Styled.Title>Nova questão</Styled.Title>
          </Styled.QuestionTitleContainer>
          <QuestionFormSubmitButton />
        </Styled.QuestionHeader>
        <Divider />
        <QuestionForm moduleSelected={defaultSelectedModule} />
      </Styled.QuestionContainer>
    </UpserQuestionProvider>
  );
}
