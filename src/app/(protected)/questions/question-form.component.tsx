"use client";

import { Button } from "antd";
import { QuillEditor } from "@/ui/quill/quill.component";
import { createQuestion } from "./actions";
import { useState } from "react";

interface QuestionFormProps {
  statement?: string;
  options?: string[];
  correctOption?: string;
}

export function QuestionForm(props: QuestionFormProps) {
  const [statement, setStatement] = useState(props.statement ?? "");
  const [options, setOptions] = useState(props.options ?? [""]);

  return (
    <form id="new-question-form" action={createQuestion}>
      <label htmlFor="statement">
        <span>Enunciado</span>
        <input
          type="hidden"
          id="statement"
          name="statement"
          value={statement}
        />
        {props.statement && (
          <div dangerouslySetInnerHTML={{ __html: props.statement }} />
        )}
        <QuillEditor
          defaultValue={props.statement}
          onChange={(value) => setStatement(value)}
        />
      </label>
      <label htmlFor="options">
        <input type="hidden" name="options" value={options} />
        <span>Alternativas</span>
        {options.map((option, index) => (
          <div key={index}>
            <QuillEditor
              defaultValue={props.options?.[index] ?? ""}
              onChange={(value) =>
                setOptions((oldOptions) => [
                  ...oldOptions.slice(0, index),
                  value,
                  ...oldOptions.slice(index + 1),
                ])
              }
            />
            <Button
              onClick={() =>
                setOptions((oldOptions) => [
                  ...oldOptions.slice(0, index),
                  ...oldOptions.slice(index + 1),
                ])
              }
            >
              Remover alternativa
            </Button>
          </div>
        ))}
      </label>
      <Button onClick={() => setOptions(options.concat(""))}>
        Adicionar alternativa
      </Button>
      <label htmlFor="correctOption">
        <span>Alternativa correta</span>
        <select
          name="correctOption"
          id="correctOption"
          defaultValue={props.correctOption ?? -1}
        >
          <option key={-1} disabled value={-1}>
            -- Selecione a alternativa correta --
          </option>
          {options.map((_, index) => (
            <option key={index} value={index + 1}>
              {index + 1}
            </option>
          ))}
        </select>
      </label>
    </form>
  );
}
