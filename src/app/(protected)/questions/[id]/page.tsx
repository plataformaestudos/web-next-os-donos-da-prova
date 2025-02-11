import * as Styled from "./page.style";

import { Button, Divider } from "antd";

import Link from "next/link";
import { LuArrowLeft } from "react-icons/lu";
import { PreviewOrEditQuestion } from "@/question/preview-or-edit-question.component";
import { QuestionFormSubmitButton } from "@/question/question-form-submit-button.component";
import { QuestionTitle } from "@/question/question-title.component";
import { UpserQuestionProvider } from "@/question/upsert/upsert-question.context";
import { createClient } from "@/util/supabase/server";

export default async function EditQuestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { id } = await params;

  const { data } = await supabase
    .from("questions")
    .select(
      `
      id,
      text,
      question_alternatives ( id, text, is_correct )
    `
    )
    .eq("id", id);

  const question = data?.[0];

  if (!question) {
    return null;
  }

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
            text: question.text,
            alternatives: question.question_alternatives,
          }}
        />
      </Styled.QuestionContainer>
    </UpserQuestionProvider>
  );
}
