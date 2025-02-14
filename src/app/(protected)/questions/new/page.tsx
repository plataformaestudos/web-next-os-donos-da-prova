import * as Styled from "./page.style";

import { Button, Divider } from "antd";

import Link from "next/link";
import { LuArrowLeft } from "react-icons/lu";
import { QuestionForm } from "@/questions/question-form.component";
import { QuestionFormSubmitButton } from "@/questions/question-form-submit-button.component";
import { UpserQuestionProvider } from "@/questions/upsert/upsert-question.context";

export default function NewQuestionPage() {
  return (
    <UpserQuestionProvider>
      <Styled.QuestionContainer>
        <Styled.QuestionHeader>
          <Styled.QuestionTitleContainer>
            <Link href="/questions">
              <Button shape="circle" icon={<LuArrowLeft />} />
            </Link>
            <Styled.Title>Nova questão</Styled.Title>
          </Styled.QuestionTitleContainer>
          <QuestionFormSubmitButton />
        </Styled.QuestionHeader>
        <Divider />
        <QuestionForm />
      </Styled.QuestionContainer>
    </UpserQuestionProvider>
  );
}
