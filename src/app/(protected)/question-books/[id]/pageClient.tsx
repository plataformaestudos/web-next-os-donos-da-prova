"use client";

import {
    Tabs,
    Breadcrumb,
    Col,
    Divider,
    Flex,
    Progress,
    Statistic,
    Row,
    theme,
    Typography,
    Button,
    Space,
    Spin
} from "antd";
import {
    QuestionCircleOutlined,
    BarChartOutlined,
    WechatOutlined,
    PauseOutlined,
    PlayCircleFilled,
    LoadingOutlined,
} from "@ant-design/icons";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import { useQuestionBookTimer } from "@/app/hooks/useQuestionBookTimer";
import { Roles } from "@/util/roles";
import { Container, TabContainer } from "./page.style";
import { AppForum } from "@/components/AppForum";
import { AppQuestionLoader } from "@/components/AppQuestionLoader";
import { FullPageLoading } from "@/ui/loading/full-page-loading";
import { QuestionBookModel } from "@/question-books/question-book.model";
import { AppQuestionCounter } from "@/components/AppQuestionCounter";
import { useState } from "react";
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
    
    const { token } = theme.useToken();

    const [question, setQuestion] = useState(questionBook?.nextQuestion);
    const timer = useQuestionBookTimer(id);

    if (loading) return <FullPageLoading />;

    if (!allowed) return null;
    const breadcrumbItems = [
        {
            title: questionBook?.folder ? "Minhas pastas" : "Meus cadernos",
            href: "/question-books",
        },
        ...(questionBook?.folder
            ? [
                {
                    title: questionBook?.folder?.name,
                    href: `/question-books?pasta=${questionBook?.folder?.id}`,
                },
            ]
            : []),
        { title: questionBook?.name },
    ].map((item) => ({
        title: item.href ? <a href={item.href}>{item.title}</a> : item.title,
    }));

    return (
        <Container>
            
            <AppQuestionCounter question={question.orderDetails.questionOrder} total={questionBook.questionsCount} />
                {questionBook.nextQuestion.module.name && (
                    <Typography.Paragraph
                        style={{
                            marginBottom: 12,
                            fontSize: 16,
                            fontWeight: "bold",
                            color: token.colorPrimaryText,
                        }}
                        type="secondary"
                    >
                        #Módulo: {questionBook.nextQuestion.module.name}
                    </Typography.Paragraph>
                )}
            
            <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
                <Breadcrumb onClick={() => timer.saveProgress()} items={breadcrumbItems}  />
                {timer.isLoaded ? (
            <Space>
                <Typography.Text strong style={{ fontSize: 18, color: token.colorPrimary }}>
                    {timer.formattedTime}
                </Typography.Text>
                <Button
                    icon={timer.isRunning ? <PauseOutlined /> : <PlayCircleFilled />}
                    onClick={timer.isRunning ? timer.pause : timer.start}
                    type="primary"
                    size="small"
                >
                </Button>
            </Space>
                ) : (
                    <div style={{ fontSize: 16, color: token.colorTextSecondary }}>
                        <Spin size="small" indicator={<LoadingOutlined />} />
                    </div>
                )}
            </Flex>
            <TabContainer>
                <Tabs
                    items={[
                        {
                            key: "1",
                            label: "Questão",
                            icon: <QuestionCircleOutlined />,
                            children: (
                                <AppQuestionLoader
                                    id={id}
                                    seq={seq}
                                    questionBook={questionBook}
                                    question={question}
                                    setQuestion={setQuestion}
                                />
                            ),
                        },
                        {
                            key: "2",
                            label: "Estatísticas",
                            icon: <BarChartOutlined />,
                            children: questionBook?.questionBookStats ? (
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
                                                    value={questionBook?.questionBookStats.totalAnswers}
                                                />
                                                <Statistic
                                                    title="Total de questões no caderno"
                                                    value={questionBook?.questionBookStats.totalQuestions}
                                                />
                                            </Flex>
                                            <Progress
                                                type="circle"
                                                percent={Math.round(
                                                    (questionBook?.questionBookStats.totalAnswers /
                                                        questionBook?.questionBookStats.totalQuestions) *
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
                                                    value={questionBook?.questionBookStats.correctAnswers}
                                                />
                                                <Statistic
                                                    title="Total de questões respondidas"
                                                    value={questionBook?.questionBookStats.totalAnswers}
                                                />
                                            </Flex>
                                            <Progress
                                                type="circle"
                                                percent={Math.round(
                                                    (questionBook?.questionBookStats.correctAnswers /
                                                        questionBook?.questionBookStats.totalAnswers) *
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
