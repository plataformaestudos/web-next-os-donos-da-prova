"use client";

import { Button, Popconfirm } from "antd";

import { FaTrash } from "react-icons/fa6";
import { deleteQuestionBook } from "./delete-question-book.action";
import { useTransition } from "react";

export function DeleteQuestionBookButton({
  questionBookId,
  onDelete,
}: {
  questionBookId: string;
  onDelete: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Popconfirm
      placement="left"
      title="Tem certeza que deseja apagar esse caderno?"
      onConfirm={() => {
        startTransition(() => {
          deleteQuestionBook(questionBookId).then(onDelete);
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
