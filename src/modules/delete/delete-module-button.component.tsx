"use client";

import { Button, Popconfirm } from "antd";

import { FaTrash } from "react-icons/fa6";
import { deleteModule } from "./delete-module.action";
import { useTransition } from "react";

export function DeleteModuleButton({
  moduleId,
  onDelete,
}: {
  moduleId: string;
  onDelete: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Popconfirm
      placement="left"
      title="Tem certeza que deseja deletar esse módulo?"
      onConfirm={() => {
        startTransition(() => {
          deleteModule(moduleId).then(onDelete);
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
        style={{
          width: "100%",
          justifyContent: "flex-start",
          padding: "0 12px",
        }}
      >
        Deletar
      </Button>
    </Popconfirm>
  );
}
