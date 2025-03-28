import * as Styled from "./page.style";

import { Button, Divider, Flex, List, Popover } from "antd";
import Item, { Meta } from "antd/es/list/Item";

import { DeleteQuestionButton } from "@/questions/delete/delete-question-button.component";
import { FaPencil } from "react-icons/fa6";
import Link from "next/link";
import { PageLayout } from "@/ui/page-layout/page-layout.component";
import { QuestionFormModulesSelection } from "@/questions/question-form-modules-selection.component";
import { QuestionPreview } from "@/questions/question-preview.component";
import { createClient } from "@/util/supabase/server";
import { redirect } from "next/navigation";

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

export default async function QuestionsPage({
  searchParams,
}: {
  searchParams: Promise<{
    modulos: string;
  }>;
}) {
  let newQuestionURL = "/questions/new";
  const { modulos: modules } = await searchParams;
  const supabase = await createClient();

  const query = supabase
    .from("questions")
    .select("*, modules_questions!inner(module_id)");

  let defaultOptions: { value: string; label: string }[] = [];
  if (modules) {
    newQuestionURL += `?modulos=${modules}`;
    query.in("modules_questions.module_id", modules.split(","));

    const { data } = await supabase
      .from("modules")
      .select("value:id, label:name")
      .in("id", modules.split(","));

    if (data) {
      defaultOptions = data;
    }
  }

  const { data: questions } = await query;

  return (
    <PageLayout
      title="Questões"
      actions={[
        <QuestionFormModulesSelection
          key="filter-modules"
          defaultOptions={defaultOptions}
          defaultValue={modules?.split(",") ?? undefined}
          onSelectModules={async function changeQuery(modules) {
            "use server";

            if (modules.length > 0) {
              redirect(`/questions?modulos=${(modules as string[]).join(",")}`);
            } else {
              redirect("/questions");
            }
          }}
        />,
        <Link key="create" href={newQuestionURL}>
          <Button type="primary" size="large">
            Criar questão
          </Button>
        </Link>,
      ]}
    >
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
                  <Popover
                    mouseEnterDelay={0.5}
                    content={
                      <Styled.QuestionPreview>
                        <QuestionPreview
                          id={question.id}
                          type={question.type}
                          text={question.text}
                          alternatives={[]}
                          compact={true}
                        />
                        <Divider style={{ margin: "12px 0" }} />
                        <EditQuestionButton key="edit" id={question.id} />
                      </Styled.QuestionPreview>
                    }
                  >
                    <Link href={`/questions/${question.id}`}>
                      {question.text
                        .replace(/<[^>]+>/g, "")
                        .slice(0, 80)
                        .trim()}
                      ...
                    </Link>
                  </Popover>
                }
                description={question.id}
              />
            </Item>
          ))}
        </List>
      </Styled.ListContainer>
    </PageLayout>
  );
}
