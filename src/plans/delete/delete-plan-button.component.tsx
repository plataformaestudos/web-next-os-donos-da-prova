"use client";

import { Button, Popconfirm } from "antd";

import { FaTrash } from "react-icons/fa6";
import { deletePlan } from "./delete-plan.action";
import { useTransition } from "react";

export function DeletePlanButton({ planId }: { planId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Popconfirm
      placement="left"
      title="Tem certeza que deseja apagar esse plano?"
      onConfirm={() => {
        startTransition(() => {
          deletePlan(planId);
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
