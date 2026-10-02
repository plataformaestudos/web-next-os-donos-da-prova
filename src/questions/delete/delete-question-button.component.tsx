"use client";

import { Button, Popconfirm, message } from "antd";

import { FaTrash } from "react-icons/fa6";
import { deleteQuestion } from "./delete-question.action";
import { useTransition } from "react";

export function DeleteQuestionButton({ questionId }: { questionId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Popconfirm
      placement="left"
      title="Tem certeza que deseja apagar essa questão?"
      onConfirm={() => {
        startTransition(async () => {
          if (await deleteQuestion(questionId) === false) message.error("Não foi possível excluir a questão.");
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
        Apagar
      </Button>
    </Popconfirm>
  );
}
