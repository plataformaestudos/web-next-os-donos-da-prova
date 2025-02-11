"use client";

import { EditOutlined, EyeOutlined } from "@ant-design/icons";
import { Flex, Segmented, Space } from "antd";
import {
  QuestionAlternativeModel,
  QuestionModel,
} from "@/model/question.model";

import { QuestionForm } from "./question-form.component";
import { QuestionPreview } from "./question-preview.component";
import { useState } from "react";

export function PreviewOrEditQuestion({
  question,
}: {
  question?: QuestionModel & { alternatives: QuestionAlternativeModel[] };
}) {
  const [editing, setEditing] = useState(false);

  return (
    <Flex vertical gap={16} justify="start">
      <Segmented
        style={{ alignSelf: "start" }}
        defaultValue={1}
        options={[
          { value: 1, label: "Visualizar", icon: <EyeOutlined /> },
          { value: 2, label: "Editar", icon: <EditOutlined /> },
        ]}
        onChange={(value) => {
          setEditing(value === 2);
        }}
      />

      {!editing && question ? (
        <QuestionPreview
          id={question.id}
          text={question.text}
          alternatives={question.alternatives}
        />
      ) : (
        <QuestionForm
          id={question?.id}
          text={question?.text}
          alternatives={question?.alternatives}
        />
      )}
    </Flex>
  );
}
