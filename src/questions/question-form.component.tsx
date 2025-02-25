"use client";

import * as Styled from "./question-form.style";

import { App, Button, Divider, Popconfirm, Select, Typography } from "antd";
import { FaChevronDown, FaX } from "react-icons/fa6";
import React, { useState } from "react";

import { PlusOutlined } from "@ant-design/icons";
import { QUESTION_FORM_ID } from "./question-form.constant";
import { TiptapEditor } from "@/ui/tiptap-editor/tiptap-editor.component";
import { useMultipleEditors } from "@/ui/tiptap-editor/use-multiple-editors.component";
import { useUpsertQuestion } from "./upsert/upsert-question.context";

const { Text } = Typography;

interface QuestionFormProps {
  id?: string;
  text?: string;
  comment?: string;
  alternatives?: {
    id: string;
    text: string;
    is_correct: boolean;
  }[];
}

export function QuestionForm(props: QuestionFormProps) {
  const { upsertQuestion, error } = useUpsertQuestion();

  const { message } = App.useApp();
  const { menu, onFocus } = useMultipleEditors();

  const [text, setText] = useState(props.text ?? "");
  const [comment, setComment] = useState(props.comment ?? "");
  const [alternatives, setAlternatives] = useState<
    { _uiId: string; text: string; id?: string }[]
  >(
    props.alternatives?.map((alt) => ({ ...alt, _uiId: alt.id })) ?? [
      { id: undefined, _uiId: "1", text: "" },
      { id: undefined, _uiId: "2", text: "" },
    ]
  );
  const [correctAlternative, setCorrectAlternative] = useState(
    props.alternatives?.find((alt) => alt.is_correct)?.id ??
      alternatives[0]._uiId
  );

  function onChangeCorrectAlternative(id: string, index: number) {
    setCorrectAlternative(id);
    message.destroy("alternativeChosen");
    message.success({
      key: "alternativeChosen",
      content: `Alternativa ${String.fromCharCode(
        65 + index
      )} marcada como a correta`,
    });
  }

  return (
    <Styled.QuestionFormContainer>
      {menu}
      <Divider />
      <form
        id={QUESTION_FORM_ID}
        action={() =>
          upsertQuestion({
            id: props.id,
            text,
            comment,
            alternatives: alternatives.map((alt) => ({
              id: alt.id,
              text: alt.text,
              is_correct: alt.id === correctAlternative,
            })),
          })
        }
      >
        <label>
          <Styled.Label>Enunciado</Styled.Label>
          <TiptapEditor
            placeholder="Enunciado"
            defaultValue={props?.text ?? ""}
            onFocus={onFocus}
            onChange={setText}
          />
        </label>
        <Divider />
        <label htmlFor="alternatives">
          <Styled.Label>Alternativas</Styled.Label>
          {alternatives.map(({ _uiId, text }, index) => (
            <Styled.Alternative key={_uiId}>
              <Button
                shape="circle"
                onClick={() => onChangeCorrectAlternative(_uiId, index)}
                type={correctAlternative === _uiId ? "primary" : "default"}
              >
                {String.fromCharCode(65 + index)}
              </Button>
              <TiptapEditor
                placeholder="Alternativa"
                defaultValue={text}
                onFocus={onFocus}
                onChange={(text) => {
                  setAlternatives(
                    alternatives.map((alt) => {
                      if (alt._uiId === _uiId) {
                        return {
                          ...alt,
                          text,
                        };
                      }
                      return alt;
                    })
                  );
                }}
              />
              <Popconfirm
                okText="Remover"
                cancelText="Cancelar"
                disabled={!text}
                placement="left"
                title="Você tem certeza que quer remover essa alternativa?"
                onConfirm={() =>
                  setAlternatives(
                    alternatives.filter((alt) => alt._uiId !== _uiId)
                  )
                }
              >
                <Button
                  icon={<FaX size={10} />}
                  size="small"
                  type="text"
                  onClick={
                    !text
                      ? () =>
                          setAlternatives(
                            alternatives.filter((alt) => alt._uiId !== _uiId)
                          )
                      : undefined
                  }
                />
              </Popconfirm>
            </Styled.Alternative>
          ))}
        </label>
        <Button
          icon={<PlusOutlined />}
          type="text"
          onClick={() =>
            setAlternatives(
              alternatives.concat({
                _uiId: Math.random().toString(),
                text: "",
              })
            )
          }
        >
          Adicionar alternativa
        </Button>
        <Divider />
        <label>
          <Styled.Label>Alternativa correta</Styled.Label>
          <Select
            style={{ width: 290 }}
            suffixIcon={<FaChevronDown />}
            placeholder="Selecione a alternativa correta"
            value={correctAlternative}
            onChange={(id, option) =>
              onChangeCorrectAlternative(
                id,
                (
                  option as {
                    value: string;
                    index: number;
                    label: string;
                  }
                ).index
              )
            }
            options={alternatives.map(({ _uiId }, index) => ({
              value: _uiId,
              index,
              label: `Alternativa ${String.fromCharCode(65 + index)}`,
            }))}
          />
        </label>
        <Divider />
        <label>
          <Styled.Label>Comentário</Styled.Label>
          <TiptapEditor
            placeholder="Comentário"
            defaultValue={props?.comment ?? ""}
            onFocus={onFocus}
            onChange={setComment}
          />
        </label>
      </form>
      {error && <Text type="danger">{error}</Text>}
    </Styled.QuestionFormContainer>
  );
}
