import {
  QuestionBookModel,
  QuestionBookNextQuestionModel,
} from "@/question-books/question-book.model";
import { Roles, verify } from "@/util/roles";
import {
  BarChartOutlined,
  QuestionCircleOutlined,
  WechatOutlined,
} from "@ant-design/icons";
import {
  Breadcrumb,
  BreadcrumbProps,
  Col,
  Divider,
  Flex,
  Progress,
  Row,
  Statistic,
  Tabs,
} from "antd";

import { AppForum } from "@/components/AppForum";
import { ResponseModel } from "@/model/common.model";
import { AnswerQuestion } from "@/question-books/answer-question/answer-question.component";
import { CACHE_TAGS } from "@/util/cache-tags.util";
import HttpClient from "@/util/http-client/fetch-server.util";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container, TabContainer } from "./page.style";
import { createClient } from "@/util/supabase/server";

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
    `/question-books/${id}/next-question?${params}`,
    {
      method: "GET",
      next: {
        tags: [CACHE_TAGS.QUESTION_BOOKS],
      },
    }
  )
    .then((response) => response.data)
    .catch(() => null);
}

function getQuestionBook(id: string) {
  return HttpClient.fetch<ResponseModel<QuestionBookModel>>(
    `/question-books/${id}`,
    {
      method: "GET",
      next: {
        tags: [CACHE_TAGS.QUESTION_BOOKS],
      },
    }
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
  if (!(await verify([Roles.ADMIN, Roles.STUDENT]))) {
    return redirect("/");
  }

  const { id } = await params;
  const { seq } = await searchParams;
  const questionBook = await getQuestionBook(id);

  if (questionBook) {
    let question = questionBook.nextQuestion;

    if (seq && parseInt(seq) !== question.orderDetails.questionOrder) {
      question =
        (await getQuestionBookQuestion(id, seq, false)) ??
        questionBook.nextQuestion;
    }

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

    const supabase = await createClient();

    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) {
      redirect("/login");
    }

    const userProfile = await supabase
      .from("profiles")
      .select("*")
      .match({ user_id: data.user.id })
      .single();

    return (
      <Container>
        <Breadcrumb items={breadcrumbItems} />
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
                    type={question.type}
                    text={question.text}
                    alternatives={question.alternatives}
                    orderDetails={question.orderDetails}
                    userAnswer={question.userAnswer}
                    module={question.module}
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
                  <Row gutter={[16, 16]}>
                    <Col
                      span={24}
                      sm={{ span: 10 }}
                    >
                      <Flex
                        align="center"
                        gap={24}
                      >
                        <Flex vertical>
                          <Statistic
                            title="Total de questões respondidas"
                            value={questionBook.questionBookStats.totalAnswers}
                          />
                          <Statistic
                            title="Total de questões no caderno"
                            value={
                              questionBook.questionBookStats.totalQuestions
                            }
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
                    </Col>
                    <Col
                      span={0}
                      sm={{ span: 2 }}
                      offset={1}
                    >
                      <Divider type="vertical" />
                    </Col>
                    <Col
                      span={24}
                      sm={{ span: 0 }}
                    >
                      <Divider type="horizontal" />
                    </Col>
                    <Col
                      span={24}
                      sm={{ span: 10 }}
                    >
                      <Flex
                        align="center"
                        gap={24}
                      >
                        <Flex vertical>
                          <Statistic
                            title="Total de questões acertadas"
                            value={
                              questionBook.questionBookStats.correctAnswers
                            }
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
                    </Col>
                  </Row>
                ) : (
                  // <Flex gap={48} align="center">
                  //   <Flex align="center" gap={24} wrap>
                  //     <Flex vertical>
                  //       <Statistic
                  //         title="Total de questões respondidas"
                  //         value={questionBook.questionBookStats.totalAnswers}
                  //       />
                  //       <Statistic
                  //         title="Total de questões no caderno"
                  //         value={questionBook.questionBookStats.totalQuestions}
                  //       />
                  //     </Flex>
                  //     <Progress
                  //       type="circle"
                  //       percent={Math.round(
                  //         (questionBook.questionBookStats.totalAnswers /
                  //           questionBook.questionBookStats.totalQuestions) *
                  //           100
                  //       )}
                  //       size="small"
                  //     />
                  //   </Flex>
                  //   <Divider
                  //     type="vertical"
                  //     orientation="center"
                  //     style={{ height: 100 }}
                  //   />
                  //   <Flex align="center" gap={24}>
                  //     <Flex vertical>
                  //       <Statistic
                  //         title="Total de questões acertadas"
                  //         value={questionBook.questionBookStats.correctAnswers}
                  //       />
                  //       <Statistic
                  //         title="Total de questões respondidas"
                  //         value={questionBook.questionBookStats.totalAnswers}
                  //       />
                  //     </Flex>
                  //     <Progress
                  //       type="circle"
                  //       percent={Math.round(
                  //         (questionBook.questionBookStats.correctAnswers /
                  //           questionBook.questionBookStats.totalAnswers) *
                  //           100
                  //       )}
                  //       size="small"
                  //     />
                  //   </Flex>
                  // </Flex>
                  <p>Nenhuma estatística encontrada!</p>
                ),
              },
              {
                key: "3",
                label: "Fórum de discussão",
                icon: <WechatOutlined />,
                children: (
                  <AppForum
                    questionId={question?.questionId || ""}
                    userId={userProfile.data?.user_id || ""}
                  />
                ),
              },
            ]}
          />
        </TabContainer>
      </Container>
    );
  }
}
