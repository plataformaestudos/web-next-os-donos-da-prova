"use client";

import { EditOutlined, EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import { Button, Card, Flex, Segmented, theme } from "antd";

import { FullQuestion } from "@/model/question.model";
import { QuestionForm } from "./question-form.component";
import { QuestionPreview } from "./question-preview.component";
import { useState } from "react";
import { TiptapEditor } from "@/ui/tiptap-editor/tiptap-editor.component";

export function PreviewOrEditQuestion({
  question,
}: {
  question?: FullQuestion;
}) {
  const [editing, setEditing] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const { token } = theme.useToken();

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
        <Flex vertical gap={16}>
          <QuestionPreview
            id={question.id}
            type={question.type}
            text={question.text}
            comment={question.comment}
            alternatives={question.alternatives}
          />
          {question.comment && (
            <>
              <Button
                onClick={() => setShowComment(!showComment)}
                icon={showComment ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              >
                {showComment ? "Esconder" : "Ver"} comentário
              </Button>
              {showComment && (
                <Card 
                  size="small" 
                  title="Comentário"
                  style={{ 
                    backgroundColor: token.colorFillTertiary,
                  }}
                >
                  <TiptapEditor
                    editable={false}
                    defaultValue={question.comment}
                    fontSize="15px"
                  />
                </Card>
              )}
            </>
          )}
        </Flex>
      ) : (
        <QuestionForm
          id={question?.id}
          type={question?.type}
          text={question?.text}
          comment={question?.comment}
          alternatives={question?.alternatives}
          moduleSelected={question?.modules[0]}
        />
      )}
    </Flex>
  );
}
