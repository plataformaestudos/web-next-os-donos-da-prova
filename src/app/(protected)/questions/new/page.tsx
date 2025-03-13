import * as Styled from "./page.style";

import { Button, Divider } from "antd";

import Link from "next/link";
import { LuArrowLeft } from "react-icons/lu";
import { QuestionForm } from "@/questions/question-form.component";
import { QuestionFormSubmitButton } from "@/questions/question-form-submit-button.component";
import { UpserQuestionProvider } from "@/questions/upsert/upsert-question.context";
import { createClient } from "@/util/supabase/server";

export default async function NewQuestionPage({
  searchParams,
}: {
  searchParams: Promise<{
    modulos: string;
  }>;
}) {
  const supabase = await createClient();
  const { modulos: modules } = await searchParams;

  let defaultSelectedModules = [] as {
    id: string;
    name: string;
  }[];
  if (modules) {
    const { data } = await supabase
      .from("modules")
      .select("id, name")
      .in("id", modules.split(","));

    if (data) {
      defaultSelectedModules = data;
    }
  }

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
        <QuestionForm modules={defaultSelectedModules} />
      </Styled.QuestionContainer>
    </UpserQuestionProvider>
  );
}
