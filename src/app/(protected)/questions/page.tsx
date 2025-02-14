import * as Styled from "./page.style";

import { Button, List } from "antd";
import Item, { Meta } from "antd/es/list/Item";

import { DeleteQuestionButton } from "@/questions/delete/delete-question-button.component";
import Link from "next/link";
import { createClient } from "@/util/supabase/server";

export default async function QuestionsPage() {
  const supabase = await createClient();

  const { data: questions } = await supabase.from("questions").select();

  return (
    <Styled.QuestionsContainer>
      <Styled.QuestionsHeader>
        <Styled.Title>Questões</Styled.Title>
        <Link href="/questions/new">
          <Button type="primary" size="large">
            Criar questão
          </Button>
        </Link>
      </Styled.QuestionsHeader>
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
    </Styled.QuestionsContainer>
  );
}
