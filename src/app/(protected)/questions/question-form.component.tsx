"use client";

import { App, Button, Divider, Popconfirm, Segmented, Select } from "antd";
import { EditOutlined, EyeOutlined, PlusOutlined } from "@ant-design/icons";
import { FaChevronDown, FaX } from "react-icons/fa6";
import React, { useState } from "react";

import { TiptapEditor } from "@/ui/tiptap-editor/tiptap-editor.component";
import clsx from "clsx";
import { createQuestion } from "./actions";
import { useCommonTokens } from "@/util/use-common-tokens.hook";
import { useMultipleEditors } from "@/ui/tiptap-editor/use-multiple-editors.component";

interface QuestionFormProps {
  id?: string;
  text?: string;
  alternatives?: {
    id: string;
    text: string;
    is_correct: boolean;
  }[];
}

export function QuestionForm(props: QuestionFormProps) {
  const { message } = App.useApp();
  const { menu, onFocus } = useMultipleEditors();

  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(props.text ?? "");
  const [alternatives, setAlternatives] = useState<
    { _uiId: string; text: string; id?: string }[]
  >(
    props.alternatives?.map((alt) => ({ ...alt, _uiId: alt.id })) ?? [
      { id: undefined, _uiId: Math.random().toString(), text: "" },
      { id: undefined, _uiId: Math.random().toString(), text: "" },
    ]
  );
  const [correctAlternative, setCorrectAlternative] = useState(
    props.alternatives?.find((alt) => alt.is_correct)?.id ??
      alternatives[0]._uiId
  );

  const { colorBgContainer } = useCommonTokens();

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
    <>
      <Segmented
        defaultValue={1}
        options={[
          { value: 1, label: "Visualizar", icon: <EyeOutlined /> },
          { value: 2, label: "Editar", icon: <EditOutlined /> },
        ]}
        onChange={(value) => {
          setEditing(value === 2);
        }}
      />
      <div
        className="mt-6 p-4 rounded-md"
        style={{ backgroundColor: colorBgContainer }}
      >
        {editing ? (
          <>
            {menu}
            <Divider />
            <form
              id="new-question-form"
              action={() =>
                createQuestion({
                  id: props.id,
                  text,
                  alternatives: alternatives.map((alt) => ({
                    id: alt.id,
                    text: alt.text,
                    is_correct: alt.id === correctAlternative,
                  })),
                })
              }
            >
              <label>
                <p className="font-bold text-lg mb-2">Enunciado</p>
                <TiptapEditor
                  placeholder="Enunciado"
                  defaultValue={props?.text ?? ""}
                  onFocus={onFocus}
                  onChange={setText}
                />
              </label>
              <Divider />
              <label htmlFor="alternatives">
                <p className="font-bold text-lg mb-2 mt-4">Alternativas</p>
                {alternatives.map(({ _uiId, text }, index) => (
                  <div key={_uiId} className="flex items-center gap-2 pb-4">
                    <Button
                      shape="circle"
                      onClick={() => onChangeCorrectAlternative(_uiId, index)}
                      type={
                        correctAlternative === _uiId ? "primary" : "default"
                      }
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
                        icon={
                          <span className="text-gray-500">
                            <FaX size={10} />
                          </span>
                        }
                        size="small"
                        type="text"
                        onClick={
                          !text
                            ? () =>
                                setAlternatives(
                                  alternatives.filter(
                                    (alt) => alt._uiId !== _uiId
                                  )
                                )
                            : undefined
                        }
                      />
                    </Popconfirm>
                  </div>
                ))}
              </label>
              <Button
                className="mt-2"
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
                <p className="font-bold text-lg mb-2 mt-4">
                  Alternativa correta
                </p>
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
            </form>
          </>
        ) : (
          <div>
            <div dangerouslySetInnerHTML={{ __html: text }} />
            <div className="mt-4 flex flex-col border border-gray-200 divide-y rounded-md">
              {alternatives.map(({ id, text }, index) => {
                return (
                  <div
                    key={id}
                    className={clsx(
                      "flex items-center gap-2 p-2 cursor-pointer hover:bg-indigo-50 transition-colors",
                      {
                        "rounded-t-md": index === 0,
                        "rounded-b-md": index === alternatives.length - 1,
                      }
                    )}
                  >
                    <span
                      className={clsx(
                        "flex items-center justify-center rounded-full text-white w-6 h-6 text-xs",
                        correctAlternative === id
                          ? "bg-indigo-600 text-white"
                          : "bg-white border border-gray-200 text-gray-950"
                      )}
                    >
                      {String.fromCharCode(65 + index)}
                    </span>
                    <div dangerouslySetInnerHTML={{ __html: text }} />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
