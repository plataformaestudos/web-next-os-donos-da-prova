import { BarChartOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import {
  Breadcrumb,
  BreadcrumbProps,
  Divider,
  Flex,
  Progress,
  Statistic,
  Tabs,
} from "antd";
import {
  QuestionBookModel,
  QuestionBookNextQuestionModel,
} from "@/question-books/question-book.model";

import { AnswerQuestion } from "@/question-books/answer-question/answer-question.component";
import HttpClient from "@/util/http-client/fetch-server.util";
import Link from "next/link";
import { ResponseModel } from "@/model/common.model";
import { TabContainer } from "./page.style";

function getQuestionBookQuestion(
  id: string,
  seq: string,
  onlyNotAnswered: boolean
) {
  const params = new URLSearchParams();

  if (seq !== undefined) {
    params.set("seq", seq);
  }

  if (onlyNotAnswered !== undefined) {
    params.set("onlyNotAnswered", onlyNotAnswered.toString());
  }

  return HttpClient.fetch<ResponseModel<QuestionBookNextQuestionModel>>(
    `/question-books/${id}/next-question?${params}`
  )
    .then((response) => response.data)
    .catch(() => null);
}

function getQuestionBook(id: string) {
  return HttpClient.fetch<ResponseModel<QuestionBookModel>>(
    `/question-books/${id}`
  ).then((response) => response.data);
}

export default async function QuestionBookPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    seq: string;
  }>;
}) {
  const { id } = await params;
  const { seq } = await searchParams;
  const questionBook = await getQuestionBook(id);

  let question = questionBook.nextQuestion;

  if (seq && parseInt(seq) !== question.orderDetails.questionOrder) {
    question =
      (await getQuestionBookQuestion(id, seq, false)) ??
      questionBook.nextQuestion;
  }

  if (questionBook) {
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
                children: question ? (
                  <AnswerQuestion
                    key={question.id}
                    questionBookId={questionBook.id}
                    questionBookQuestionId={question.id}
                    comment={question.comment}
                    text={question.text}
                    alternatives={question.alternatives}
                    orderDetails={question.orderDetails}
                    userAnswer={question.userAnswer}
                  />
                ) : (
                  <p>Nenhuma questão encontrada!</p>
                ),
              },
              {
                key: "2",
                label: "Estatísticas",
                icon: <BarChartOutlined />,
                children: questionBook.questionBookStats ? (
                  <Flex gap={48} align="center">
                    <Flex align="center" gap={24}>
                      <Flex vertical>
                        <Statistic
                          title="Total de questões respondidas"
                          value={questionBook.questionBookStats.totalAnswers}
                        />
                        <Statistic
                          title="Total de questões no caderno"
                          value={questionBook.questionBookStats.totalQuestions}
                        />
                      </Flex>
                      <Progress
                        type="circle"
                        percent={Math.round(
                          (questionBook.questionBookStats.totalAnswers /
                            questionBook.questionBookStats.totalQuestions) *
                            100
                        )}
                        size="small"
                      />
                    </Flex>
                    <Divider
                      type="vertical"
                      orientation="center"
                      style={{ height: 100 }}
                    />
                    <Flex align="center" gap={24}>
                      <Flex vertical>
                        <Statistic
                          title="Total de questões acertadas"
                          value={questionBook.questionBookStats.correctAnswers}
                        />
                        <Statistic
                          title="Total de questões respondidas"
                          value={questionBook.questionBookStats.totalAnswers}
                        />
                      </Flex>
                      <Progress
                        type="circle"
                        percent={Math.round(
                          (questionBook.questionBookStats.correctAnswers /
                            questionBook.questionBookStats.totalAnswers) *
                            100
                        )}
                        size="small"
                      />
                    </Flex>
                  </Flex>
                ) : (
                  <p>Nenhuma estatística encontrada!</p>
                ),
              },
            ]}
          />
        </TabContainer>
      </div>
    );
  }
}
