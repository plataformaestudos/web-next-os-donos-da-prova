import { Button, List } from "antd";
import Item, { Meta } from "antd/es/list/Item";

import { DeleteQuestionButton } from "@/question/delete/delete-question-button.component";
import Link from "next/link";
import { createClient } from "@/util/supabase/server";

export default async function QuestionsPage() {
  const supabase = await createClient();

  const { data: questions } = await supabase.from("questions").select();

  return (
    <div className="py-4 px-8 w-full">
      <div className="flex justify-between items-center pb-4 border-b border-b-gray-200">
        <h1 className="text-4xl font-bold">Questões</h1>
        <Link href="/questions/new">
          <Button type="primary" size="large">
            Criar questão
          </Button>
        </Link>
      </div>
      <div className="mt-4">
        <List>
          {questions?.map((question) => (
            <Item
              key={question.id}
              actions={[
                <Link key="edit" href={`/questions/${question.id}`}>
                  Editar
                </Link>,
                <DeleteQuestionButton key="delete" questionId={question.id} />,
              ]}
            >
              <Meta
                title={question.text.replace(/<[^>]+>/g, "")}
                description={question.id}
              />
            </Item>
          ))}
        </List>
      </div>
    </div>
  );
}
