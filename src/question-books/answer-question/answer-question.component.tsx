"use client";

import {
    Alternative,
    AlternativeLetter,
    AlternativesContainer,
    Container,
    QuestionContainer,
    NavButton
} from "./answer-question.style";
import { Button, Flex, Tooltip, Typography, App, Input, Space } from "antd";
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


import { useState, useTransition, Fragment } from "react";

import { QuestionBookNextQuestionModel } from "../question-book.model";
import { QuestionType } from "@/model/question.model";
import { TiptapEditor } from "@/ui/tiptap-editor/tiptap-editor.component";
import { answerQuestion } from "./answer-question.action";
import { useRouter } from "next/navigation";

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
}: AnswerQuestionProps) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<boolean>(false);
    const app = App.useApp?.();
    const [correctAlternative, setCorrectAlternative] = useState<string | null>(
        (userAnswer && alternatives.find(({ isCorrect }) => isCorrect)?.id) ?? null
    );
    const [showComment, setShowComment] = useState<boolean>(false);

    const [selectedAlternative, setSelectedAlternative] = useState<string | null>(
        userAnswer?.alternativeId ?? null
    );
    const [discardedAlternatives, setDiscardedAlternatives] = useState<
        Set<string>
    >(new Set());
    const [navigationInput, setNavigationInput] = useState<string>("");

    function toggleDiscard(id: string) {
        if (discardedAlternatives.has(id)) {
            discardedAlternatives.delete(id);
        } else {
            discardedAlternatives.add(id);
        }
        setDiscardedAlternatives(new Set(discardedAlternatives));
    }
    const router = useRouter();
    const goTo = (seq?: number | null | "random") => {
        if (seq === "random") {
            const randomSeq = Math.floor(Math.random() * totalQuestions);
            router.push(`/question-books/${questionBookId}?seq=${randomSeq}`);
            return;
        }
        if (!seq && seq !== 0) return;
        router.push(`/question-books/${questionBookId}?seq=${seq}`);
    };

    const goToSpecificQuestion = () => {
        const questionNumber = parseInt(navigationInput);
        if (isNaN(questionNumber) || questionNumber < 1 || questionNumber > totalQuestions) {
            app?.message.error(`Por favor, insira um número entre 1 e ${totalQuestions}`);
            return;
        }
        const seq = questionNumber;
        router.push(`/question-books/${questionBookId}?seq=${seq}`);
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
                                            title="Descartar questão"
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
                        }
                    });
                }}
            >
                Responder questão
            </Button>
            <br />
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
                                        {String.fromCharCode(
                                            65 +
                                            (alternatives.findIndex(
                                                (alt) => alt.id === correctAlternative
                                            ) as number)
                                        )}
                                    </b>
                                </span>
                            )}
                        </Typography.Text>
                        {comment && (
                            <Button
                                onClick={() => setShowComment(!showComment)}
                                icon={showComment ? <EyeInvisibleOutlined /> : <EyeOutlined />}
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
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    margin: "16px 0 0",
                }}
            >
                <Flex gap={16}>
                    <Tooltip title="Questão anterior não resolvida">
                        <NavButton
                            $enabled={!!shouldShowPrevUnanswered}
                            $variant="pill"
                            disabled={!shouldShowPrevUnanswered}
                            onClick={() => goTo(orderDetails.previousUnansweredOrder)}
                            icon={<TbPlayerTrackPrev size={22} />}
                        />
                    </Tooltip>
                    <Tooltip title="Questão anterior">
                        <NavButton
                            $enabled={!!shouldShowPrev}
                            $variant="pill"
                            disabled={!shouldShowPrev}
                            onClick={() => goTo(orderDetails.previousOrder)}
                        >
                            <TbArrowNarrowLeft size={22} />
                        </NavButton>
                    </Tooltip>
                </Flex>
                
                {/* Campo de navegação direta */}
                <Flex align="center" gap={8}>
                    <Typography.Text style={{ fontSize: 14 }}>
                        Ir para:
                    </Typography.Text>
                    <Space.Compact>
                        <Input
                            placeholder="Ex: 35"
                            value={navigationInput}
                            onChange={(e) => setNavigationInput(e.target.value)}
                            onPressEnter={goToSpecificQuestion}
                            style={{ width: 80 }}
                            min={1}
                            max={totalQuestions}
                        />
                        <Button
                            type="primary"
                            icon={<SearchOutlined />}
                            onClick={goToSpecificQuestion}
                            disabled={!navigationInput.trim()}
                        >
                            Ir
                        </Button>
                    </Space.Compact>
                </Flex>

                <Flex gap={16}>
                    <Tooltip title="Próxima questão">
                        <NavButton
                            $enabled={!!shouldShowNext}
                            $variant="pill"
                            disabled={!shouldShowNext}
                            onClick={() => goTo(orderDetails.nextOrder)}
                        >
                            <TbArrowNarrowRight size={22} />
                        </NavButton>
                    </Tooltip>
                    <Tooltip title="Próxima questão aleatória">
                        <NavButton
                            $enabled={!!shouldShowNext}
                            $variant="pill"
                            disabled={!shouldShowNext}
                            onClick={() => goTo("random")}
                        >
                            <LiaRandomSolid size={22} />
                        </NavButton>
                    </Tooltip>
                    <Tooltip title="Próxima não resolvida">
                        <NavButton
                            $enabled={!!shouldShowNextUnanswered}
                            $variant="pill"
                            disabled={!shouldShowNextUnanswered}
                            onClick={() => goTo(orderDetails.nextUnansweredOrder)}
                            icon={<TbPlayerTrackNext size={22} />}
                        />
                    </Tooltip>
                </Flex>
            </div>
        </Container>
    );
}
