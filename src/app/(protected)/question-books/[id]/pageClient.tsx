"use client";

import { Tabs, Breadcrumb, Col, Divider, Flex, Progress, Statistic, Row } from "antd";
import { QuestionCircleOutlined, BarChartOutlined, WechatOutlined } from "@ant-design/icons";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import { Roles } from "@/util/roles";
import { Container, TabContainer } from "./page.style";
import { AppForum } from "@/components/AppForum";
import { AppQuestionLoader } from "@/components/AppQuestionLoader";
import { FullPageLoading } from "@/ui/loading/full-page-loading";
import { QuestionBookModel } from "@/question-books/question-book.model";
export function QuestionBookPageClient({
  id,
  seq,
  questionBook,
}: {
  id: string;
  seq: string;
  questionBook: QuestionBookModel;
}) {
  const { user, loading, allowed } = useAuthGuard({
    requireRoles: [Roles.ADMIN, Roles.STUDENT],
  });

if (loading) return <FullPageLoading />;

  if (!allowed) return null; 

  const question = questionBook.nextQuestion;

  const breadcrumbItems = [
    {
      title: questionBook.folder ? "Minhas pastas" : "Meus cadernos",
      href: "/question-books",
    },
    ...(questionBook.folder
      ? [{ title: questionBook.folder.name, href: `/question-books?pasta=${questionBook.folder.id}` }]
      : []),
    { title: questionBook.name },
  ].map((item) => ({
    title: item.href ? <a href={item.href}>{item.title}</a> : item.title,
  }));

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
              children: (
                <AppQuestionLoader id={id} seq={seq} questionBook={questionBook} />
              ),
            },
            {
              key: "2",
              label: "Estatísticas",
              icon: <BarChartOutlined />,
              children: questionBook.questionBookStats ? (
                <Row gutter={[16, 16]}>
                  <Col span={24} sm={{ span: 10 }}>
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
                  </Col>
                  <Col span={0} sm={{ span: 2 }} offset={1}>
                    <Divider type="vertical" />
                  </Col>
                  <Col span={24} sm={{ span: 0 }}>
                    <Divider type="horizontal" />
                  </Col>
                  <Col span={24} sm={{ span: 10 }}>
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
                  </Col>
                </Row>
              ) : (
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
                  userId={user?.id || ""}
                />
              ),
            },
          ]}
        />
      </TabContainer>
    </Container>
  );
}
