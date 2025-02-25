import * as Styled from "./page.style";

import { Button, Divider, Flex, List, Popover, Tooltip } from "antd";
import Item, { Meta } from "antd/es/list/Item";

import { DeleteQuestionButton } from "@/questions/delete/delete-question-button.component";
import { FaPencil } from "react-icons/fa6";
import Link from "next/link";
import { createClient } from "@/util/supabase/server";

function EditQuestionButton({ id }: { id: string }) {
  return (
    <Link key="edit" href={`/questions/${id}`}>
      <Flex gap={8} align="center">
        <FaPencil />
        <span>Editar</span>
      </Flex>
    </Link>
  );
}

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
      <Styled.ListContainer>
        <List>
          {questions?.map((question) => (
            <Item
              key={question.id}
              actions={[
                <EditQuestionButton key="edit" id={question.id} />,
                <DeleteQuestionButton key="delete" questionId={question.id} />,
              ]}
            >
              <Meta
                title={
                  <Tooltip title="Pré-visualizar">
                    <Popover
                      placement="right"
                      trigger={"click"}
                      content={
                        <Styled.QuestionPreview>
                          <div
                            dangerouslySetInnerHTML={{ __html: question.text }}
                          />
                          <Divider />
                          <EditQuestionButton key="edit" id={question.id} />
                        </Styled.QuestionPreview>
                      }
                    >
                      <span style={{ cursor: "pointer" }}>
                        {question.text
                          .replace(/<[^>]+>/g, "")
                          .slice(0, 80)
                          .trim()}
                        ...
                      </span>
                    </Popover>
                  </Tooltip>
                }
                description={question.id}
              />
            </Item>
          ))}
        </List>
      </Styled.ListContainer>
    </Styled.QuestionsContainer>
  );
}
