import { Button, Divider } from "antd";

import Link from "next/link";
import { LuArrowLeft } from "react-icons/lu";
import { QuestionForm } from "../question-form.component";
import { QuestionTitle } from "./copy-question-id.component";
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
    <div className="py-4 px-8 w-full">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/questions">
            <Button shape="circle" icon={<LuArrowLeft />} />
          </Link>
          <QuestionTitle id={question.id} />
        </div>
        <Button
          type="primary"
          size="large"
          form="new-question-form"
          htmlType="submit"
        >
          Salvar
        </Button>
      </div>
      <Divider />
      <QuestionForm
        id={question.id}
        text={question.text}
        alternatives={question.question_alternatives}
      />
    </div>
  );
}
