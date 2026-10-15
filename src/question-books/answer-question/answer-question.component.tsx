"use client";

import {
    Alternative,
    AlternativeLetter,
    AlternativesContainer,
    Container,
    QuestionContainer,
    NavButton
} from "./answer-question.style";
import { Button, Flex, Tooltip, Typography, App, Input, Space, Divider } from "antd";
import {
    EyeInvisibleOutlined,
    EyeOutlined,
    StrikethroughOutlined,
    SearchOutlined,
} from "@ant-design/icons";
import {
    TbArrowNarrowLeft,
    TbArrowNarrowRight,
    TbPlayerTrackNext,
    TbPlayerTrackPrev
} from "react-icons/tb";
import { LiaRandomSolid } from "react-icons/lia";


import { useState, useTransition, Fragment, useEffect } from "react";

import { QuestionBookNextQuestionModel } from "../question-book.model";
import { QuestionType } from "@/model/question.model";
import { TiptapEditor } from "@/ui/tiptap-editor/tiptap-editor.component";
import { answerQuestion } from "./answer-question.action";
import { useRouter } from "next/navigation";
import { useTheme } from "styled-components";
import { QuestionReportModal } from "./question-report-modal.component";
import { QuestionReportData } from "@/types/question-report.types";
import HttpClient from "@/util/http-client/fetch-client.util";

// Componente reutilizável para o campo de navegação
const NavigationField = ({ 
    isMobile = false, 
    navigationInput, 
    setNavigationInput, 
    goToSpecificQuestion, 
    totalQuestions 
}: { 
    isMobile?: boolean;
    navigationInput: string;
    setNavigationInput: (value: string) => void;
    goToSpecificQuestion: () => void;
    totalQuestions: number;
}) => (
    <Flex 
        align="center" 
        gap="clamp(6px, 2vw, 12px)"
        justify="center"
        style={isMobile ? { 
            width: "100%", 
            padding: "clamp(8px, 3vw, 16px) 0" 
        } : undefined}
    >
        <Typography.Text style={{ 
            fontSize: "clamp(12px, 3vw, 14px)", 
            color: "#666" 
        }}>
            Ir para:
        </Typography.Text>
        <Space.Compact>
            <Input
                placeholder="Ex: 35"
                value={navigationInput}
                onChange={(e) => setNavigationInput(e.target.value)}
                onPressEnter={goToSpecificQuestion}
                style={{ 
                    width: "clamp(70px, 15vw, 100px)",
                    fontSize: "clamp(12px, 3vw, 14px)"
                }}
                min={1}
                max={totalQuestions}
            />
            <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={goToSpecificQuestion}
                disabled={!navigationInput.trim()}
                style={{
                    fontSize: "clamp(12px, 3vw, 14px)",
                    padding: "clamp(4px, 2vw, 8px) clamp(8px, 3vw, 16px)"
                }}
            >
                Ir
            </Button>
        </Space.Compact>
    </Flex>
);

interface AnswerQuestionProps {
    questionBookId: string;
    questionBookQuestionId: string;
    type: QuestionType;
    text: string;
    comment: string | null;
    alternatives: {
        id: string;
        text: string;
        isCorrect: boolean;
    }[];
    orderDetails: QuestionBookNextQuestionModel["orderDetails"];
    userAnswer: QuestionBookNextQuestionModel["userAnswer"];
    totalQuestions: number;
    onAnswerSubmitted?: () => void;
    onNavigateQuestion?: (seq?: number | null, random?: boolean) => void;
}

export function AnswerQuestion({
    questionBookId,
    questionBookQuestionId,
    text,
    type,
    comment,
    alternatives,
    userAnswer,
    orderDetails,
    totalQuestions,
    onAnswerSubmitted,
    onNavigateQuestion,
}: AnswerQuestionProps) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<boolean>(false);
    const app = App.useApp?.();
    const theme = useTheme();
    const [correctAlternative, setCorrectAlternative] = useState<string | null>(
        (userAnswer && alternatives.find(({ isCorrect }) => isCorrect)?.id) ?? null
    );
    const [showComment, setShowComment] = useState<boolean>(false);
    const [isMobile, setIsMobile] = useState(false);
    
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    
    
    const [selectedAlternative, setSelectedAlternative] = useState<string | null>(
        userAnswer?.alternativeId ?? null
    );
    const [discardedAlternatives, setDiscardedAlternatives] = useState<
        Set<string>
    >(new Set());
    const [navigationInput, setNavigationInput] = useState<string>("");

    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
    }, []);
    
    const handleReportSubmit = async (reportData: QuestionReportData): Promise<void> => {
        try {
            await HttpClient.fetch<{ success: boolean; message: string }>(
                '/question-reports',
                {
                    method: 'POST',
                    body: JSON.stringify(reportData)
                },
                false 
            );
            
        } catch (error) {
            console.error('Erro ao enviar reporte:', error);
            throw error;
        }
    };
    function toggleDiscard(id: string) {
        if (discardedAlternatives.has(id)) {
            discardedAlternatives.delete(id);
        } else {
            discardedAlternatives.add(id);
        }
        setDiscardedAlternatives(new Set(discardedAlternatives));
    }
    const router = useRouter();
    const goTo = (seq?: number | null, seqRandom?: boolean) => {
        if (!seq && seq !== 0 && !seqRandom) return;
        if (onNavigateQuestion) {
            onNavigateQuestion(seq, seqRandom);
            return;
        }
        if (seqRandom) {
            router.push(`/question-books/${questionBookId}?seqRandom=true`);
            return;
        }
        router.push(`/question-books/${questionBookId}?seq=${seq}`);
    };

    const goToSpecificQuestion = () => {
        const questionNumber = parseInt(navigationInput);
        if (isNaN(questionNumber) || questionNumber < 1 || questionNumber > totalQuestions) {
            app?.message.error(`Por favor, insira um número entre 1 e ${totalQuestions}`);
            return;
        }
        const seq = questionNumber;
        goTo(seq);
        setNavigationInput("");
    };


    const isAlternativesDisabled = correctAlternative !== null;
    const shouldShowPrev = orderDetails.previousOrder !== null;
    const shouldShowNext = orderDetails.nextOrder !== null;
    const shouldShowNextUnanswered = orderDetails.nextUnansweredOrder !== null;
    const shouldShowPrevUnanswered = orderDetails.previousUnansweredOrder !== null;

    return (
        <Container>
            <QuestionContainer>
                <TiptapEditor
                    editable={false}
                    defaultValue={text}
                    fontSize="15px"
                />
                {alternatives.length > 0 && (
                    <AlternativesContainer>
                        {alternatives.map(({ id, text }, index) => {
                            return (
                                <Alternative
                                    key={id}
                                    $lineThrough={discardedAlternatives.has(id)}
                                    $disabled={isAlternativesDisabled}
                                    $correct={isAlternativesDisabled && correctAlternative == id}
                                    $incorrect={
                                        isAlternativesDisabled && selectedAlternative == id
                                    }
                                    onClick={() => {
                                        if (!isAlternativesDisabled) {
                                            setSelectedAlternative(id);
                                        }
                                    }}
                                >
                                    <AlternativeLetter $selected={selectedAlternative === id}>
                                        {type === QuestionType.MULTIPLE_CHOICE &&
                                            String.fromCharCode(65 + index)}
                                    </AlternativeLetter>
                                    <TiptapEditor
                                        editable={false}
                                        defaultValue={text}
                                    />
                                    {type === QuestionType.MULTIPLE_CHOICE && (
                                        <Tooltip
                                            title="Descartar alternativa"
                                            placement="left"
                                        >
                                            <Button
                                                type="link"
                                                icon={<StrikethroughOutlined />}
                                                onClick={(ev) => {
                                                    ev.stopPropagation();
                                                    if (!isAlternativesDisabled) {
                                                        toggleDiscard(id);
                                                    }
                                                }}
                                            />
                                        </Tooltip>
                                    )}
                                </Alternative>
                            );
                        })}
                    </AlternativesContainer>
                )}
            </QuestionContainer>
            <Flex justify="flex-end">
                <Button
                    disabled={!selectedAlternative || isPending || isAlternativesDisabled}
                    type="primary"
                    onClick={() => {
                        setError(false);
                        startTransition(async () => {
                            const result = await answerQuestion({
                                questionBookQuestionId,
                                alternativeId: selectedAlternative as string,
                            });

                            if (result.error) {
                                setError(true);
                                app?.message.error("Não foi possível salvar a resposta neste momento, tente novamente!"); // Notificação de erro
                            } else {
                                setCorrectAlternative(result.data?.correctAlternativeId ?? null);
                                app?.message.success("Resposta enviada com sucesso!");

                                onAnswerSubmitted?.();
                            }
                        });
                    }}
                >
                    Responder questão
                </Button>
            </Flex>
            
            <br />

            {correctAlternative && selectedAlternative && !error && (
                <Fragment>
                    <Flex
                        vertical
                        gap={16}
                        align="center"
                    >
                        <Typography.Text
                            type={
                                correctAlternative === selectedAlternative ? "success" : "danger"
                            }
                            style={{
                                fontSize: 18,
                                fontWeight: 700,
                            }}
                        >
                            {correctAlternative === selectedAlternative ? (
                                <span>Você acertou!</span>
                            ) : (
                                <span>
                                    Você errou!{" "}
                                    <b>
                                        Gabarito:{" "}
                                        {type === QuestionType.RIGHT_OR_WRONG
                                            ? (alternatives.find((alt) => alt.id === correctAlternative)?.text.toLowerCase().includes("certo") ? "Certo" : "Errado")
                                            : String.fromCharCode(
                                                65 +
                                                (alternatives.findIndex(
                                                    (alt) => alt.id === correctAlternative
                                                ) as number)
                                            )
                                        }
                                    </b>
                                </span>
                            )}
                        </Typography.Text>
                        {comment && (
                            <Button
                                onClick={() => setShowComment(!showComment)}
                                icon={showComment ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                                style={{ marginBottom: 16 }}
                            >
                                {showComment ? "Esconder" : "Ver"} resolução
                            </Button>
                        )}
                    </Flex>
                    {comment && showComment && (
                        <TiptapEditor
                            editable={false}
                            defaultValue={comment}
                            fontSize="15px"
                        />
                    )}
                </Fragment>
            )}

             <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <Typography.Text type="secondary" style={{ fontSize: '14px' }}>
                    Encontrou algum erro nesta questão?{' '}
                    <Button 
                        type="link" 
                        onClick={() => setIsReportModalOpen(true)}
                        style={{ padding: 0, height: 'auto', fontSize: '14px', color: theme.colorPrimary, fontWeight: 600 }}
                    >
                        Fale conosco
                    </Button>
                </Typography.Text>
            </div>

            {/* Divider para separar resolução da navegação */}
            <Divider style={{ margin: "24px 0 16px 0" }} />

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    margin: "clamp(12px, 3vw, 16px) 0 0",
                    flexWrap: "wrap",
                    gap: isMobile ? "clamp(4px, 1.5vw, 8px)" : "clamp(8px, 2vw, 16px)",
                    alignItems: "center"
                }}
            >
                <Flex gap={isMobile ? "clamp(4px, 1.5vw, 8px)" : "clamp(8px, 2vw, 16px)"}>
                    <Tooltip title="Questão anterior não resolvida">
                        <NavButton
                            $enabled={!!shouldShowPrevUnanswered}
                            $variant="pill"
                            $compact={isMobile}
                            disabled={!shouldShowPrevUnanswered}
                            onClick={() => goTo(orderDetails.previousUnansweredOrder)}
                            icon={<TbPlayerTrackPrev size={isMobile ? "clamp(14px, 3vw, 18px)" : "clamp(18px, 4vw, 22px)"} />}
                        />
                    </Tooltip>
                    <Tooltip title="Questão anterior">
                        <NavButton
                            $enabled={!!shouldShowPrev}
                            $variant="pill"
                            $compact={isMobile}
                            disabled={!shouldShowPrev}
                            onClick={() => goTo(orderDetails.previousOrder)}
                            icon={<TbArrowNarrowLeft size={isMobile ? "clamp(14px, 3vw, 18px)" : "clamp(18px, 4vw, 22px)"} />}
                        >
                            {/* <TbArrowNarrowLeft size={isMobile ? "clamp(14px, 3vw, 18px)" : "clamp(18px, 4vw, 22px)"} /> */}
                        </NavButton>
                    </Tooltip>
                </Flex>

                {/* Campo de navegação direta - Desktop */}
                {!isMobile && (
                    <NavigationField 
                        navigationInput={navigationInput}
                        setNavigationInput={setNavigationInput}
                        goToSpecificQuestion={goToSpecificQuestion}
                        totalQuestions={totalQuestions}
                    />
                )}
                


                <Flex gap={isMobile ? "clamp(4px, 1.5vw, 8px)" : "clamp(8px, 2vw, 16px)"}>
                    <Tooltip title="Próxima questão">
                        <NavButton
                            $enabled={!!shouldShowNext}
                            $variant="pill"
                            $compact={isMobile}
                            disabled={!shouldShowNext}
                            onClick={() => goTo(orderDetails.nextOrder)}
                            icon={<TbArrowNarrowRight size={isMobile ? "clamp(14px, 3vw, 18px)" : "clamp(18px, 4vw, 22px)"} />}
                        >
                            {/* <TbArrowNarrowRight size={isMobile ? "clamp(14px, 3vw, 18px)" : "clamp(18px, 4vw, 22px)"} /> */}
                        </NavButton>
                    </Tooltip>
                    <Tooltip title="Próxima questão aleatória">
                        <NavButton
                            $enabled={true}
                            $variant="pill"
                            $compact={isMobile}
                            disabled={false}
                            onClick={() => goTo(orderDetails.nextOrder, true)}
                            icon={<LiaRandomSolid size={isMobile ? "clamp(14px, 3vw, 18px)" : "clamp(18px, 4vw, 22px)"} />}
                        >
                            {/* <LiaRandomSolid size={isMobile ? "clamp(14px, 3vw, 18px)" : "clamp(18px, 4vw, 22px)"} /> */}
                        </NavButton>
                    </Tooltip>
                    <Tooltip title="Próxima não resolvida">
                        <NavButton
                            $enabled={!!shouldShowNextUnanswered}
                            $variant="pill"
                            $compact={isMobile}
                            disabled={!shouldShowNextUnanswered}
                            onClick={() => goTo(orderDetails.nextUnansweredOrder)}
                            icon={<TbPlayerTrackNext size={isMobile ? "clamp(14px, 3vw, 18px)" : "clamp(18px, 4vw, 22px)"} />}
                        />
                    </Tooltip>
                </Flex>



            {/* Campo de navegação direta - Mobile */}
            {isMobile && (
                <>
                    <Divider style={{ margin: "clamp(16px, 4vw, 24px) 0 clamp(12px, 3vw, 16px) 0" }} />
                    <NavigationField 
                        isMobile={true}
                        navigationInput={navigationInput}
                        setNavigationInput={setNavigationInput}
                        goToSpecificQuestion={goToSpecificQuestion}
                        totalQuestions={totalQuestions}
                    />
                </>
            )}
            </div>
            
            <QuestionReportModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                onSubmit={handleReportSubmit}
                questionBookId={questionBookId}
                questionBookQuestionId={questionBookQuestionId}
            />
        </Container>
    );
}
