"use client";

import { Button, Popconfirm } from "antd";

import { FaTrash } from "react-icons/fa6";
import { deleteQuestion } from "./delete-question.action";
import { useTransition } from "react";

export function DeleteQuestionButton({ questionId }: { questionId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Popconfirm
      placement="left"
      title="Tem certeza que deseja deletar essa questão?"
      onConfirm={() => {
        startTransition(() => {
          deleteQuestion(questionId);
        });
      }}
      okText="Sim"
      cancelText="Não"
    >
      <Button
        type="link"
        danger
        disabled={isPending}
        loading={isPending}
        icon={<FaTrash />}
      >
        Deletar
      </Button>
    </Popconfirm>
  );
}
