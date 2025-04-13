"use client";

import {
  Alternative,
  AlternativeLetter,
  AlternativesContainer,
  Container,
  QuestionContainer,
} from "./answer-question.style";
import { Button, Flex, Tooltip, Typography } from "antd";
import {
  EyeInvisibleOutlined,
  EyeOutlined,
  StrikethroughOutlined,
} from "@ant-design/icons";
import {
  TbArrowNarrowLeft,
  TbArrowNarrowRight,
  TbArrowNarrowRightDashed,
  TbQuestionMark,
} from "react-icons/tb";
import { useState, useTransition } from "react";

import Link from "next/link";
import { QuestionBookNextQuestionModel } from "../question-book.model";
import { QuestionType } from "@/model/question.model";
import { TiptapEditor } from "@/ui/tiptap-editor/tiptap-editor.component";
import { answerQuestion } from "./answer-question.action";

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
  module: QuestionBookNextQuestionModel["module"];
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
  module,
}: AnswerQuestionProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<boolean>(false);
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

  function toggleDiscard(id: string) {
    if (discardedAlternatives.has(id)) {
      discardedAlternatives.delete(id);
    } else {
      discardedAlternatives.add(id);
    }
    setDiscardedAlternatives(new Set(discardedAlternatives));
  }

  const isAlternativesDisabled = correctAlternative !== null;

  const shouldShowPrev = orderDetails.previousOrder !== null;
  const shouldShowNext = orderDetails.nextOrder !== null;
  const shouldShowNextUnanswered = orderDetails.nextUnansweredOrder !== null;

  return (
    <Container>
      <QuestionContainer>
        {module && (
          <Typography.Paragraph
            style={{ marginBottom: 4, fontSize: 12 }}
            type="secondary"
          >
            Módulo: {module.name}
          </Typography.Paragraph>
        )}
        <TiptapEditor editable={false} defaultValue={text} />
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
                  <TiptapEditor editable={false} defaultValue={text} />
                  {type === QuestionType.MULTIPLE_CHOICE && (
                    <Tooltip title="Descartar questão" placement="left">
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

          // Optimistic update
          setCorrectAlternative(
            alternatives.find(({ isCorrect }) => isCorrect)?.id ?? null
          );

          startTransition(() => {
            answerQuestion({
              questionBookQuestionId,
              alternativeId: selectedAlternative as string,
            })
              .then((r) => r.data)
              .then(({ correctAlternativeId }) => {
                setCorrectAlternative(correctAlternativeId);
              })
              .catch(() => {
                setError(true);
              });
          });
        }}
      >
        Responder questão
      </Button>
      <br />
      <br />
      {error && (
        <Typography.Text type="danger">
          Não foi possível salvar a resposta neste momento, tente novamente!
        </Typography.Text>
      )}
      {correctAlternative && selectedAlternative && (
        <Flex vertical gap={16} align="start">
          <Typography.Text
            type={
              correctAlternative === selectedAlternative ? "success" : "danger"
            }
          >
            {correctAlternative === selectedAlternative ? (
              "Resposta correta!"
            ) : (
              <span>
                Resposta incorreta.{" "}
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
          {comment && showComment && (
            <TiptapEditor editable={false} defaultValue={comment} />
          )}
        </Flex>
      )}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          margin: "16px 0 0",
        }}
      >
        <Tooltip title="Questão anterior">
          <Button disabled={!shouldShowPrev}>
            <Link
              href={`/question-books/${questionBookId}?seq=${orderDetails.previousOrder}`}
            >
              <Flex gap={4}>
                <TbArrowNarrowLeft size={20} />
                <TbQuestionMark size={20} />
              </Flex>
            </Link>
          </Button>
        </Tooltip>
        <Flex gap={8}>
          <Tooltip title="Próxima não resolvida">
            <Button disabled={!shouldShowNextUnanswered}>
              <Link
                href={`/question-books/${questionBookId}?seq=${orderDetails.nextUnansweredOrder}`}
              >
                <Flex gap={4}>
                  <TbQuestionMark size={20} />
                  <TbArrowNarrowRightDashed size={20} />
                </Flex>
              </Link>
            </Button>
          </Tooltip>
          <Tooltip title="Próxima questão">
            <Button disabled={!shouldShowNext}>
              <Link
                href={`/question-books/${questionBookId}?seq=${orderDetails.nextOrder}`}
              >
                <Flex gap={4}>
                  <TbQuestionMark size={20} />
                  <TbArrowNarrowRight size={20} />
                </Flex>
              </Link>
            </Button>
          </Tooltip>
        </Flex>
      </div>
    </Container>
  );
}
