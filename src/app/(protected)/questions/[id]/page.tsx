import * as Styled from "./page.style";

import { Button, Divider } from "antd";
import { Roles, verify } from "@/util/roles";

import Link from "next/link";
import { LuArrowLeft } from "react-icons/lu";
import { PreviewOrEditQuestion } from "@/questions/preview-or-edit-question.component";
import { QuestionFormSubmitButton } from "@/questions/question-form-submit-button.component";
import { QuestionTitle } from "@/questions/question-title.component";
import { UpserQuestionProvider } from "@/questions/upsert/upsert-question.context";
import { createClient } from "@/util/supabase/server";
import { redirect } from "next/navigation";

export default async function EditQuestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await verify([Roles.ADMIN, Roles.COLLABORATOR]))) {
    return redirect("/");
  }

  const supabase = await createClient();
  const { id } = await params;

  const { data } = await supabase
    .from("questions")
    .select(
      `
      id,
      text,
      type,
      comment,
      alternatives:question_alternatives ( id, text, is_correct ),
      modules:modules_questions ( ...modules(id, name) )
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
