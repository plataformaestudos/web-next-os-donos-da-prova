"use client";

import {
    Tabs,
    Col,
    Flex,
    Progress,
    Statistic,
    Row,
    theme,
    Typography,
    Tag,
    Card,
    Empty,
    Button,
} from "antd";
import {
    QuestionCircleOutlined,
    BarChartOutlined,
    WechatOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    EyeOutlined,
    EyeInvisibleOutlined,
} from "@ant-design/icons";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import { Roles } from "@/util/roles";
import { AppForum } from "@/components/AppForum";
import { FullPageLoading } from "@/ui/loading/full-page-loading";
import { useState } from "react";
import { QuestionType } from "@/model/question.model";
import { Container, TabContainer, ModuleInfo, QuestionViewContainer, QuestionContent, QuestionContainer, AlternativesContainer, AlternativeLetter, Alternative, TabContent } from "./page.style";
import { TiptapEditor } from "@/ui/tiptap-editor/tiptap-editor.component";

interface QuestionStats {
  totalAnswers: number;
  correctAnswers: number;
  accuracyPercentage: number;
  answers: Array<{
    id: string;
    alternativeId: string;
    isCorrect: boolean;
    answeredAt: string;
    alternativeText: string;
  }>;
}

interface QuestionData {
  id: string;
  text: string;
  type: string;
  comment: string | null;
  alternatives: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
  module: {
    id: string;
    name: string;
  } | null;
  stats: QuestionStats | null;
}

export function QuestionViewPageClient({ question }: { question: QuestionData }) {
    const { user, loading, allowed } = useAuthGuard({
        requireRoles: [Roles.ADMIN, Roles.STUDENT],
    });
    
    const { token } = theme.useToken();

    if (loading) return <FullPageLoading />;

    if (!allowed) return null;


    // const formatDate = (dateString: string) => {
    //     return new Date(dateString).toLocaleString('pt-BR');
    // };

    const getAccuracyColor = (percentage: number) => {
        if (percentage >= 80) return '#52c41a';
        if (percentage >= 60) return '#faad14';
        return '#ff4d4f';
    };

    // Componente de visualização de questão
    const QuestionViewComponent = () => {
        const [showComment, setShowComment] = useState<boolean>(false);
        const [showAnswer, setShowAnswer] = useState<boolean>(false);

        return (
            <QuestionViewContainer>
                <QuestionContent>
                    <QuestionContainer>
                        <TiptapEditor
                            editable={false}
                            defaultValue={question.text}
                            fontSize="15px"
                        />

                        {question.alternatives.length > 0 && (
                            <AlternativesContainer>
                                {question.alternatives.map(({ id, text, isCorrect }, index) => (
                                    <Alternative
                                        key={id}
                                        $correct={isCorrect}
                                        $showAnswer={showAnswer}
                                    >
                                        <AlternativeLetter 
                                            $selected={false}
                                            $correct={showAnswer && isCorrect}
                                        >
                                            {question.type === QuestionType.MULTIPLE_CHOICE
                                                ? String.fromCharCode(65 + index)
                                                : ''}
                                        </AlternativeLetter>
                                        <div style={{ flex: 1 }}>
                                            <TiptapEditor
                                                editable={false}
                                                defaultValue={text}
                                            />
                                        </div>
                                        {showAnswer && isCorrect && (
                                            <Tag color="success" icon={<CheckCircleOutlined />}>
                                                Resposta correta
                                            </Tag>
                                        )}
                                    </Alternative>
                                ))}
                            </AlternativesContainer>
                        )}
                    </QuestionContainer>

                    <Flex gap="small" wrap>
                        {question.comment && (
                            <Button
                                onClick={() => setShowComment(!showComment)}
                                icon={showComment ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                            >
                                {showComment ? "Esconder" : "Ver"} comentário
                            </Button>
                        )}
                        <Button
                            onClick={() => setShowAnswer(!showAnswer)}
                            icon={showAnswer ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                            type="primary"
                        >
                            {showAnswer ? "Esconder" : "Ver"} resposta
                        </Button>
                    </Flex>

                    {question.comment && showComment && (
                        <Card 
                            size="small" 
                            title="Comentário"
                            style={{ 
                                backgroundColor: token.colorFillTertiary,
                                marginTop: 16
                            }}
                        >
                            <TiptapEditor
                                editable={false}
                                defaultValue={question.comment}
                                fontSize="15px"
                            />
                        </Card>
                    )}
                </QuestionContent>
            </QuestionViewContainer>
        );
        
    };

    return (
        <Container>
            {question.module && (
                <ModuleInfo>
                    #Módulo: {question.module.name}
                </ModuleInfo>
            )}

            <TabContainer>
                <TabContent>
                    <Tabs
                    items={[
                        {
                            key: "1",
                            label: "Questão",
                            icon: <QuestionCircleOutlined />,
                            children: <QuestionViewComponent />,
                        },
                    {
                        key: "2",
                        label: "Respostas",
                        icon: <BarChartOutlined />,
                        children: question.stats ? (
                            <div>
                                <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                                    <Col span={24} sm={{ span: 8 }}>
                                        <Card>
                                            <Statistic
                                                title="Total de tentativas"
                                                value={question.stats?.totalAnswers || 0}
                                                prefix={<ClockCircleOutlined />}
                                            />
                                        </Card>
                                    </Col>
                                    <Col span={24} sm={{ span: 8 }}>
                                        <Card>
                                            <Statistic
                                                title="Acertos"
                                                value={question.stats?.correctAnswers || 0}
                                                prefix={<CheckCircleOutlined />}
                                                valueStyle={{ color: '#52c41a' }}
                                            />
                                        </Card>
                                    </Col>
                                    <Col span={24} sm={{ span: 8 }}>
                                        <Card>
                                            <Flex vertical align="center" gap="small">
                                                <Progress
                                                    type="circle"
                                                    percent={question.stats?.accuracyPercentage || 0}
                                                    strokeColor={getAccuracyColor(question.stats?.accuracyPercentage || 0)}
                                                    size={120}
                                                    format={(percent) => (
                                                        <Typography.Text 
                                                            strong 
                                                            style={{ 
                                                                fontSize: 16, 
                                                                color: getAccuracyColor(question.stats?.accuracyPercentage || 0) 
                                                            }}
                                                        >
                                                            {percent}%
                                                        </Typography.Text>
                                                    )}
                                                />
                                                <Typography.Text type="secondary">
                                                    Taxa de acerto
                                                </Typography.Text>
                                            </Flex>
                                        </Card>
                                    </Col>
                                </Row>

                                {/* <Card title="Histórico de Respostas">
                                    {question.stats?.answers.length && question.stats.answers.length > 0 ? (
                                        <List
                                            dataSource={question.stats?.answers || []}
                                            renderItem={(answer, index) => (
                                                <List.Item
                                                    key={answer.id}
                                                >
                                                    <Card
                                                        size="small"
                                                        style={{
                                                            width: '100%',
                                                            backgroundColor: answer.isCorrect 
                                                                ? token.colorSuccessBg 
                                                                : token.colorErrorBg,
                                                            borderColor: answer.isCorrect 
                                                                ? token.colorSuccess 
                                                                : token.colorError,
                                                        }}
                                                    >
                                                        <List.Item.Meta
                                                            avatar={
                                                                answer.isCorrect ? (
                                                                    <CheckCircleOutlined 
                                                                        style={{ 
                                                                            color: token.colorSuccess, 
                                                                            fontSize: 20 
                                                                        }} 
                                                                    />
                                                                ) : (
                                                                    <CloseCircleOutlined 
                                                                        style={{ 
                                                                            color: token.colorError, 
                                                                            fontSize: 20 
                                                                        }} 
                                                                    />
                                                                )
                                                            }
                                                            title={
                                                                <Space>
                                                                    <Typography.Text strong>
                                                                        Tentativa #{question.stats?.answers.length ? question.stats.answers.length - index : 0}
                                                                    </Typography.Text>
                                                                    <Tag color={answer.isCorrect ? 'success' : 'error'}>
                                                                        {answer.isCorrect ? 'Correta' : 'Incorreta'}
                                                                    </Tag>
                                                                </Space>
                                                            }
                                                            description={
                                                                <Space direction="vertical" size="small">
                                                                    <Typography.Text>
                                                                        <Typography.Text strong>Resposta escolhida:</Typography.Text> {answer.alternativeText}
                                                                    </Typography.Text>
                                                                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                                                                        {formatDate(answer.answeredAt)}
                                                                    </Typography.Text>
                                                                </Space>
                                                            }
                                                        />
                                                    </Card>
                                                </List.Item>
                                            )}
                                        />
                                    ) : (
                                        <Empty 
                                            description="Nenhuma resposta encontrada" 
                                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        />
                                    )}
                                </Card> */}
                            </div>
                        ) : (
                            <Empty 
                                description="Nenhuma estatística encontrada" 
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                        ),
                    },
                    {
                        key: "3",
                        label: "Fórum de discussão",
                        icon: <WechatOutlined />,
                        children: (
                            <AppForum
                                questionId={question.id}
                                userId={user?.id || ""}
                            />
                        ),
                    },
                    ]}
                    />
                </TabContent>
            </TabContainer>
        </Container>
    );
}
