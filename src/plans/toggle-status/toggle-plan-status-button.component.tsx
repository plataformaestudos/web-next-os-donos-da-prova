"use client";

import { Button, Popconfirm } from "antd";
import { FaToggleOn, FaToggleOff } from "react-icons/fa6";
import { togglePlanStatus } from "./toggle-plan-status.action";
import { useTransition } from "react";

interface TogglePlanStatusButtonProps {
  planId: string;
  currentStatus: string;
}

export function TogglePlanStatusButton({ planId, currentStatus }: TogglePlanStatusButtonProps) {
  const [isPending, startTransition] = useTransition();
  
  const isActive = currentStatus === 'ACTIVE';
  const actionText = isActive ? 'desativar' : 'ativar';
  const confirmText = `Tem certeza que deseja ${actionText} esse plano?`;

  return (
    <Popconfirm
      placement="left"
      title={confirmText}
      onConfirm={() => {
        startTransition(() => {
          togglePlanStatus(planId, currentStatus);
        });
      }}
      okText="Sim"
      cancelText="Não"
    >
      <Button
        type="link"
        disabled={isPending}
        loading={isPending}
        icon={isActive ? <FaToggleOn /> : <FaToggleOff />}
        style={{
          color: isActive ? '#52c41a' : '#ff4d4f',
          fontSize: '16px'
        }}
      >
        {isActive ? 'Desativar' : 'Ativar'}
      </Button>
    </Popconfirm>
  );
}
