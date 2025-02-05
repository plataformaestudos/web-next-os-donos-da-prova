import { Button, Tooltip } from "antd";
import { LuArrowLeft, LuClipboardCopy } from "react-icons/lu";

import Link from "next/link";
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
      statement,
      question_options ( id, description, is_correct )
    `
    )
    .eq("id", id);

  const question = data![0];

  return (
    <div className="py-4 px-8 w-full">
      <div className="flex justify-between items-center pb-4 border-b border-b-gray-200">
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
      <div className="mt-4">
        <QuestionForm
          statement={question.statement}
          options={question.question_options.map((qo) => qo.description)}
          correctOption={(
            question.question_options.findIndex((qo) => qo.is_correct) + 1
          )?.toString()}
        />
      </div>
    </div>
  );
}
