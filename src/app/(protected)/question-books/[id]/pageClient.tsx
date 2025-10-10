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
    Spin
} from "antd";
import {
    QuestionCircleOutlined,
    BarChartOutlined,
    WechatOutlined,
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
import { OwlTimer } from "@/components/OwlTimer";
import { useState, useEffect } from "react";
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
    const timer = useQuestionBookTimer(id); // Timer is per question book, not per question
    const [isTimerVisible, setIsTimerVisible] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);

        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

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
        title: item.href ? (
            <span onClick={() => timer.saveProgress()}>
                <a href={item.href}>{item.title}</a>
            </span>
        ) : (
            <span onClick={() => timer.saveProgress()}>{item.title}</span>
        ),
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
                <Breadcrumb items={breadcrumbItems} />
                {/* Timer para mobile - aparece apenas em telas pequenas */}
                {isMobile && timer.isLoaded ? (
                    <OwlTimer
                        formattedTime={timer.formattedTime}
                        isRunning={timer.isRunning}
                        isVisible={isTimerVisible}
                        onToggleVisibility={() => setIsTimerVisible(!isTimerVisible)}
                        onToggleTimer={timer.isRunning ? timer.pause : timer.start}
                    />
                ) : isMobile && !timer.isLoaded ? (
                    <div style={{ fontSize: 16, color: token.colorTextSecondary }}>
                        <Spin size="small" indicator={<LoadingOutlined />} />
                    </div>
                ) : null}
            </Flex>
            
            {/* Container para timer grudado no TabContainer */}
            <div style={{ position: 'relative' }}>
                {/* Timer grudado no TabContainer - apenas em telas grandes */}
                {!isMobile && (
                    <div style={{
                        position: 'absolute',
                        top: '-145px',
                        right: '15px',
                        zIndex: 1000
                    }}>
                        {timer.isLoaded ? (
                            <OwlTimer
                                formattedTime={timer.formattedTime}
                                isRunning={timer.isRunning}
                                isVisible={isTimerVisible}
                                onToggleVisibility={() => setIsTimerVisible(!isTimerVisible)}
                                onToggleTimer={timer.isRunning ? timer.pause : timer.start}
                            />
                        ) : (
                            <div style={{ 
                                fontSize: 'clamp(12px, 2.5vw, 16px)', 
                                color: token.colorTextSecondary 
                            }}>
                                <Spin size="small" indicator={<LoadingOutlined />} />
                            </div>
                        )}
                    </div>
                )}
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
            </div>
        </Container>
    );
}

