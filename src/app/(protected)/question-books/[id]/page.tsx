import { Breadcrumb, BreadcrumbProps, Tabs } from "antd";

import { AnswerQuestion } from "@/question-books/answer-question/answer-question.component";
import HttpClient from "@/util/http-client/fetch-server.util";
import Link from "next/link";
import { QuestionBook } from "@/question-books/question-book.component";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { ResponseModel } from "@/model/common.model";
import { TabContainer } from "./page.style";
import { createClient } from "@/util/supabase/server";

function asSingle<T>(array: T[]) {
  return array as T;
}

enum QuestionType {
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
  RIGHT_OR_WRONG = "RIGHT_OR_WRONG",
}

interface QuestionBookNextQuestionModel {
  question: {
    id: string;
    text: string;
    comment: string | null;
    type: QuestionType | null;
    questionAlternatives: [
      {
        id: string;
        text: string;
        isCorrect: boolean;
      }
    ];
  };
  finished: boolean;
}

interface QuestionBook {
  id: string;
  name: string;
  folder: {
    id: string;
    name: string;
  };
}

function getQuestionBookNextQuestion(
  id: string
): Promise<QuestionBookNextQuestionModel | null> {
  return HttpClient.fetch<ResponseModel<QuestionBookNextQuestionModel>>(
    `/question-books/${id}/next-question`
  )
    .then((r) => r.data)
    .catch(() => null);
}

async function getQuestionBook(id: string): Promise<{
  questionBook: QuestionBook | null;
  nextQuestion: QuestionBookNextQuestionModel | null;
}> {
  const supabase = await createClient();
  const [questionBook, nextQuestion] = await Promise.all([
    await supabase
      .from("question_books")
      .select(
        `
    id,
    name,
    folder:book_folders(id, name)
  `
      )
      .eq("id", id)
      .single()
      .then((response) => {
        if (response.data) {
          return {
            ...response.data,
            folder: asSingle(response.data.folder),
          };
        } else {
          return null;
        }
      }),
    getQuestionBookNextQuestion(id),
  ]);
  return { questionBook, nextQuestion };
}

export default async function QuestionBookPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    pagina: string;
  }>;
}) {
  const { pagina: page = "0" } = await searchParams;
  const { id } = await params;

  const { questionBook, nextQuestion } = await getQuestionBook(id);

  if (questionBook && nextQuestion) {
    const breadcrumbItems: BreadcrumbProps["items"] = [
      {
        title: (
          <Link href="/question-books">
            {questionBook.folder ? "Minhas pastas" : "Meus cadernos"}
          </Link>
        ),
      },
    ];

    if (questionBook.folder) {
      breadcrumbItems.push({
        title: (
          <Link href={`/question-books?pasta=${questionBook.folder.id}`}>
            {questionBook.folder.name}
          </Link>
        ),
      });
    }

    breadcrumbItems.push({
      title: questionBook.name,
    });

    return (
      <div style={{ padding: "16px 32px", flex: 1 }}>
        <Breadcrumb style={{ marginBottom: 24 }} items={breadcrumbItems} />
        <TabContainer>
          <Tabs
            items={[
              {
                key: "1",
                label: "Questões",
                icon: <QuestionCircleOutlined />,
                children: (
                  <AnswerQuestion
                    questionBookId={questionBook.id}
                    questionId={nextQuestion.question.id}
                    comment={nextQuestion.question.comment}
                    text={nextQuestion.question.text}
                    alternatives={nextQuestion.question.questionAlternatives.map(
                      ({ id, text }) => ({ id, text })
                    )}
                  />
                ),
              },
            ]}
          />
        </TabContainer>
      </div>
    );
  }
}
