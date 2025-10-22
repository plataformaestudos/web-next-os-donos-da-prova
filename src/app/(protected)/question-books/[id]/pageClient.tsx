"use client";

import {
    Tabs,
    Breadcrumb,
    Col,
    Flex,
    Progress,
    Statistic,
    Row,
    theme,
    Typography,
    Spin,
    Card,
    Space,
    Button
} from "antd";
import {
    QuestionCircleOutlined,
    BarChartOutlined,
    WechatOutlined,
    LoadingOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ThunderboltOutlined,
    UserOutlined,
    ClockCircleOutlined,
    EyeOutlined,
    EyeInvisibleOutlined,
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
import { QuestionGeneralStats } from "@/model/question.model";
import { getQuestionGeneralStats } from "../question-stats.api";
import HttpClient from "@/util/http-client/fetch-client.util";
import { ResponseModel } from "@/model/common.model";
export function QuestionBookPageClient({
    id,
    seq,
    seqRandom,
    questionBook,
}: {
    id: string;
    seq: string;
    seqRandom: boolean;
    questionBook: QuestionBookModel;
}) {
    const { user, loading, allowed } = useAuthGuard({
        requireRoles: [Roles.ADMIN, Roles.STUDENT],
    });

    const { token } = theme.useToken();

    const [currentQuestionBook, setCurrentQuestionBook] = useState(questionBook);
    const [question, setQuestion] = useState(questionBook?.nextQuestion);
    const timer = useQuestionBookTimer(id);
    const [isTimerVisible, setIsTimerVisible] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [questionStats, setQuestionStats] = useState<QuestionGeneralStats | null>(null);
    const [isLoadingStats, setIsLoadingStats] = useState(false);
    const [isStatsVisible, setIsStatsVisible] = useState(true);

    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);

        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    const fetchQuestionStats = async () => {
        if (!question?.questionId) return;

        setIsLoadingStats(true);
        try {
            const stats = await getQuestionGeneralStats(question.questionId);
            setQuestionStats(stats);
        } catch (error) {
            console.error('Erro ao buscar estatísticas da questão:', error);
            setQuestionStats(null);
        } finally {
            setIsLoadingStats(false);
        }
    };

    const reloadQuestionBook = async () => {
        try {
            const response = await HttpClient.fetch<ResponseModel<QuestionBookModel>>(
                `/question-books/${id}`,
                { method: "GET" },
                true
            );
            setCurrentQuestionBook(response.data);
        } catch (error) {
            console.error('Erro ao recarregar dados do caderno:', error);
        }
    };

    const handleAnswerSubmitted = async () => {
        await Promise.all([
            fetchQuestionStats(),
            reloadQuestionBook()
        ]);
    };

    useEffect(() => {
        fetchQuestionStats();
    }, [question?.questionId]);

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
            {/* Layout para Desktop */}
            {!isMobile ? (
                <Flex align="center" style={{ marginBottom: 16 }}>
                    <AppQuestionCounter question={question.orderDetails.questionOrder} total={currentQuestionBook.questionsCount} />

                    <div style={{
                        marginLeft: -1,
                        padding: "2px 10px",
                        borderRadius: "0 6px 6px 0",
                        width: "fit-content"
                    }}>
                        <Flex align="center" gap={16}>

                            {isStatsVisible && (
                                <>
                                    <Space size={4}>
                                        <ClockCircleOutlined style={{ color: token.colorInfo, fontSize: 15 }} />
                                        <Typography.Text style={{ fontSize: 15, fontWeight: 600, color: token.colorText }}>
                                            {currentQuestionBook.questionBookStats.totalAnswers} {currentQuestionBook.questionBookStats.totalAnswers > 1 ? 'resolvidas' : 'resolvida'}
                                        </Typography.Text>
                                    </Space>

                                    <Space size={4}>
                                        <CheckCircleOutlined style={{ color: token.colorSuccess, fontSize: 15 }} />
                                        <Typography.Text style={{ fontSize: 15, fontWeight: 600, color: token.colorText }}>
                                            {currentQuestionBook.questionBookStats.correctAnswers} {currentQuestionBook.questionBookStats.correctAnswers > 1 ? 'corretas' : 'correta'}
                                        </Typography.Text>
                                    </Space>
                                    <Space size={4}>
                                        <CloseCircleOutlined style={{ color: token.colorError, fontSize: 15 }} />
                                        <Typography.Text style={{ fontSize: 15, fontWeight: 600, color: token.colorText }}>
                                            {currentQuestionBook.questionBookStats.wrongAnswers} {currentQuestionBook.questionBookStats.wrongAnswers > 1 ? 'incorretas' : 'incorreta'}
                                        </Typography.Text>
                                    </Space>
                                </>
                            )}
                            <Button
                                type="text"
                                size="large"
                                icon={isStatsVisible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                                onClick={() => setIsStatsVisible(!isStatsVisible)}
                                style={{
                                    padding: "2px 4px",
                                    minWidth: "auto",
                                    height: "auto",
                                    color: token.colorText
                                }}
                            />
                        </Flex>
                    </div>
                </Flex>
            ) : (
                /* Layout para Mobile */
                <div style={{ marginBottom: 6 }}>
                    <Flex align="center" justify="space-between" style={{ marginBottom: isStatsVisible ? 12 : 0 }}>
                        <AppQuestionCounter question={question.orderDetails.questionOrder} total={currentQuestionBook.questionsCount} />
                        <Button
                            type="text"
                            size="small"
                            icon={isStatsVisible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                            onClick={() => setIsStatsVisible(!isStatsVisible)}
                            style={{
                                padding: "4px 8px",
                                minWidth: "auto",
                                height: "auto",
                                color: token.colorText,
                            }}
                        />
                    </Flex>

                    {isStatsVisible && (
                        <div style={{
                            padding: "6px 0px",
                            marginTop: 8,
                        }}>
                            <Flex gap={8}>
                                <Flex align="center" gap={8}>
                                    <Space size={4}>
                                        <ClockCircleOutlined style={{ color: token.colorInfo, fontSize: 12 }} />
                                        <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: token.colorText }}>
                                            {currentQuestionBook.questionBookStats.totalAnswers} {currentQuestionBook.questionBookStats.totalAnswers > 1 ? 'resolvidas' : 'resolvida'}
                                        </Typography.Text>
                                    </Space>

                                    <Space size={4}>
                                        <CheckCircleOutlined style={{ color: token.colorSuccess, fontSize: 12 }} />
                                        <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: token.colorText }}>
                                            {currentQuestionBook.questionBookStats.correctAnswers} {currentQuestionBook.questionBookStats.correctAnswers > 1 ? 'corretas' : 'correta'}
                                        </Typography.Text>
                                    </Space>
                                </Flex>

                                <Flex align="center" gap={8}>
                                    <Space size={4}>
                                        <CloseCircleOutlined style={{ color: token.colorError, fontSize: 12 }} />
                                        <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: token.colorText }}>
                                            {currentQuestionBook.questionBookStats.wrongAnswers} {currentQuestionBook.questionBookStats.wrongAnswers > 1 ? 'incorretas' : 'incorreta'}
                                        </Typography.Text>
                                    </Space>
                                </Flex>
                            </Flex>
                        </div>
                    )}
                </div>
            )}

            {question.module.name && (
                <Typography.Paragraph
                    style={{
                        marginBottom: 12,
                        fontSize: 16,
                        fontWeight: "bold",
                        color: token.colorPrimaryText,
                    }}
                    type="secondary"
                >
                    #Módulo: {question.module.name}
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
                                        seqRandom={seqRandom}
                                        question={question}
                                        setQuestion={setQuestion}
                                        onAnswerSubmitted={handleAnswerSubmitted}
                                    />
                                ),
                            },
                            {
                                key: "2",
                                label: "Estatísticas",
                                icon: <BarChartOutlined />,
                                children: isLoadingStats ? (
                                    <div style={{
                                        textAlign: 'center',
                                        padding: 'clamp(40px, 8vw, 80px)'
                                    }}>
                                        <Spin size="large" />
                                        <Typography.Text
                                            style={{
                                                marginTop: 'clamp(16px, 4vw, 24px)',
                                                fontSize: 'clamp(16px, 4vw, 18px)',
                                                display: 'block',
                                                color: token.colorTextSecondary
                                            }}
                                        >
                                            Carregando estatísticas...
                                        </Typography.Text>
                                    </div>
                                ) : questionStats ? (
                                    <div style={{ padding: 'clamp(16px, 4vw, 24px)' }}>
                                        {/* Header com título e progresso principal */}
                                        <Card
                                            style={{
                                                marginBottom: 'clamp(16px, 4vw, 24px)',
                                                background: `linear-gradient(135deg, ${token.colorPrimaryBg} 0%, ${token.colorBgContainer} 100%)`,
                                                border: `1px solid ${token.colorBorderSecondary}`,
                                                borderRadius: 'clamp(8px, 2vw, 12px)'
                                            }}
                                            styles={{ body: { padding: 'clamp(16px, 4vw, 24px)' } }}
                                        >
                                            <Flex justify="space-between" align="center" wrap="wrap" gap="clamp(16px, 4vw, 24px)">
                                                <div>
                                                    <Typography.Title
                                                        level={3}
                                                        style={{
                                                            margin: 0,
                                                            fontSize: 'clamp(18px, 4vw, 24px)',
                                                            color: token.colorTextHeading
                                                        }}
                                                    >
                                                        📊 Estatísticas da Questão
                                                    </Typography.Title>
                                                    <Typography.Text
                                                        type="secondary"
                                                        style={{ fontSize: 'clamp(14px, 3vw, 16px)' }}
                                                    >
                                                        Dados de performance desta questão
                                                    </Typography.Text>
                                                </div>
                                                <div style={{ textAlign: 'center' }}>
                                                    <Progress
                                                        type="circle"
                                                        percent={Math.round(questionStats.accuracyPercentage)}
                                                        size={120}
                                                        strokeColor={{
                                                            '0%': token.colorSuccess,
                                                            '100%': token.colorPrimary,
                                                        }}
                                                        trailColor={token.colorBorderSecondary}
                                                    />
                                                    <Typography.Text
                                                        strong
                                                        style={{
                                                            display: 'block',
                                                            marginTop: 8,
                                                            fontSize: 'clamp(14px, 3vw, 16px)',
                                                            color: token.colorTextHeading
                                                        }}
                                                    >
                                                        Taxa de Acerto
                                                    </Typography.Text>
                                                </div>
                                            </Flex>
                                        </Card>

                                        {/* Cards de estatísticas */}
                                        <Row gutter={[12, 12]}>
                                            <Col xs={24} sm={12} md={8} lg={6}>
                                                <Card
                                                    style={{
                                                        height: '100%',
                                                        background: `linear-gradient(135deg, ${token.colorInfoBg} 0%, ${token.colorBgContainer} 100%)`,
                                                        border: `1px solid ${token.colorInfoBorder}`,
                                                        borderRadius: 'clamp(8px, 2vw, 12px)'
                                                    }}
                                                    styles={{ body: { padding: 'clamp(12px, 3vw, 16px)' } }}
                                                >
                                                    <Statistic
                                                        title={
                                                            <Flex align="center" gap={6}>
                                                                <UserOutlined style={{ color: token.colorInfo, fontSize: 'clamp(14px, 3vw, 16px)' }} />
                                                                <span style={{ fontSize: 'clamp(12px, 2.5vw, 14px)' }}>Total de Respostas</span>
                                                            </Flex>
                                                        }
                                                        value={questionStats.totalAnswers}
                                                        valueStyle={{
                                                            fontSize: 'clamp(18px, 4vw, 24px)',
                                                            color: token.colorInfo,
                                                            fontWeight: 'bold'
                                                        }}
                                                    />
                                                </Card>
                                            </Col>

                                            <Col xs={24} sm={12} md={8} lg={6}>
                                                <Card
                                                    style={{
                                                        height: '100%',
                                                        background: `linear-gradient(135deg, ${token.colorSuccessBg} 0%, ${token.colorBgContainer} 100%)`,
                                                        border: `1px solid ${token.colorSuccessBorder}`,
                                                        borderRadius: 'clamp(8px, 2vw, 12px)'
                                                    }}
                                                    styles={{ body: { padding: 'clamp(12px, 3vw, 16px)' } }}
                                                >
                                                    <Statistic
                                                        title={
                                                            <Flex align="center" gap={6}>
                                                                <CheckCircleOutlined style={{ color: token.colorSuccess, fontSize: 'clamp(14px, 3vw, 16px)' }} />
                                                                <span style={{ fontSize: 'clamp(12px, 2.5vw, 14px)' }}>Respostas Corretas</span>
                                                            </Flex>
                                                        }
                                                        value={questionStats.correctAnswers}
                                                        valueStyle={{
                                                            fontSize: 'clamp(18px, 4vw, 24px)',
                                                            color: token.colorSuccess,
                                                            fontWeight: 'bold'
                                                        }}
                                                    />
                                                </Card>
                                            </Col>

                                            <Col xs={24} sm={12} md={8} lg={6}>
                                                <Card
                                                    style={{
                                                        height: '100%',
                                                        background: `linear-gradient(135deg, ${token.colorErrorBg} 0%, ${token.colorBgContainer} 100%)`,
                                                        border: `1px solid ${token.colorErrorBorder}`,
                                                        borderRadius: 'clamp(8px, 2vw, 12px)'
                                                    }}
                                                    styles={{ body: { padding: 'clamp(12px, 3vw, 16px)' } }}
                                                >
                                                    <Statistic
                                                        title={
                                                            <Flex align="center" gap={6}>
                                                                <CloseCircleOutlined style={{ color: token.colorError, fontSize: 'clamp(14px, 3vw, 16px)' }} />
                                                                <span style={{ fontSize: 'clamp(12px, 2.5vw, 14px)' }}>Respostas Incorretas</span>
                                                            </Flex>
                                                        }
                                                        value={questionStats.incorrectAnswers}
                                                        valueStyle={{
                                                            fontSize: 'clamp(18px, 4vw, 24px)',
                                                            color: token.colorError,
                                                            fontWeight: 'bold'
                                                        }}
                                                    />
                                                </Card>
                                            </Col>

                                            <Col xs={24} sm={12} md={8} lg={6}>
                                                <Card
                                                    style={{
                                                        height: '100%',
                                                        background: `linear-gradient(135deg, ${token.colorWarningBg} 0%, ${token.colorBgContainer} 100%)`,
                                                        border: `1px solid ${token.colorWarningBorder}`,
                                                        borderRadius: 'clamp(8px, 2vw, 12px)'
                                                    }}
                                                    styles={{ body: { padding: 'clamp(12px, 3vw, 16px)' } }}
                                                >
                                                    <Statistic
                                                        title={
                                                            <Flex align="center" gap={6}>
                                                                <ThunderboltOutlined style={{ color: token.colorWarning, fontSize: 'clamp(14px, 3vw, 16px)' }} />
                                                                <span style={{ fontSize: 'clamp(12px, 2.5vw, 14px)' }}>Nível de Dificuldade</span>
                                                            </Flex>
                                                        }
                                                        value={questionStats.difficulty.toFixed(1)}
                                                        valueStyle={{
                                                            fontSize: 'clamp(18px, 4vw, 24px)',
                                                            color: token.colorWarning,
                                                            fontWeight: 'bold'
                                                        }}
                                                    />
                                                </Card>
                                            </Col>
                                        </Row>
                                    </div>
                                ) : (
                                    <div style={{
                                        textAlign: 'center',
                                        padding: 'clamp(40px, 8vw, 80px)'
                                    }}>
                                        <Typography.Text
                                            type="secondary"
                                            style={{
                                                fontSize: 'clamp(16px, 4vw, 18px)',
                                                lineHeight: 1.5
                                            }}
                                        >
                                            📊 Nenhuma estatística encontrada para esta questão!
                                        </Typography.Text>
                                    </div>
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

