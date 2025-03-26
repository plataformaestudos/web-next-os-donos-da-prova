"use client";

import {
  Alternative,
  AlternativeLetter,
  AlternativesContainer,
  Container,
  QuestionContainer,
} from "./answer-question.style";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  StrikethroughOutlined,
} from "@ant-design/icons";
import { Button, Flex, Space, Tooltip, Typography } from "antd";
import { useState, useTransition } from "react";

import Link from "next/link";
import { TiptapEditor } from "@/ui/tiptap-editor/tiptap-editor.component";
import { answerQuestion } from "./answer-question.action";
import { useSearchParams } from "next/navigation";

interface AnswerQuestionProps {
  questionBookId: string;
  questionId: string;
  text: string;
  comment: string | null;
  alternatives: {
    id: string;
    text: string;
  }[];
  seq: number;
  lastSeq: number;
  finished: boolean;
}

export function AnswerQuestion({
  questionBookId,
  questionId,
  text,
  comment,
  alternatives,
  lastSeq,
}: AnswerQuestionProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<boolean>(false);
  const [correctAlternative, setCorrectAlternative] = useState<string | null>(
    null
  );
  const [showComment, setShowComment] = useState<boolean>(false);

  const [selectedAlternative, setSelectedAlternative] = useState<string | null>(
    null
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

  const params = useSearchParams();
  const isAlternativesDisabled = correctAlternative !== null;
  const currentSeq = parseInt(params.get("seq") ?? "1");
  const shouldShowPrev = currentSeq > 1;
  const shouldShowNext = currentSeq < lastSeq;

  return (
    <Container>
      <QuestionContainer>
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
                    {String.fromCharCode(65 + index)}
                  </AlternativeLetter>
                  <TiptapEditor editable={false} defaultValue={text} />
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
                </Alternative>
              );
            })}
          </AlternativesContainer>
        )}
      </QuestionContainer>
      <Button
        disabled={!selectedAlternative || isPending || isAlternativesDisabled}
        loading={isPending}
        type="primary"
        onClick={() => {
          setError(false);
          startTransition(() => {
            answerQuestion({
              questionId,
              alternativeId: selectedAlternative as string,
              questionBookId,
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
          margin: "0 -15px",
        }}
      >
        <Button type="link" disabled={!shouldShowPrev}>
          <Link
            href={`/question-books/${questionBookId}?seq=${currentSeq - 1}`}
          >
            <Space>
              <ArrowLeftOutlined />
              Questão anterior
            </Space>
          </Link>
        </Button>
        <Button type="link" disabled={!shouldShowNext}>
          <Link
            href={`/question-books/${questionBookId}?seq=${currentSeq + 1}`}
          >
            <Space>
              Próxima questão
              <ArrowRightOutlined />
            </Space>
          </Link>
        </Button>
      </div>
    </Container>
  );
}
