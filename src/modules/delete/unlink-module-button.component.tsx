"use client";

import { Button, Popconfirm } from "antd";

import { FaLinkSlash } from "react-icons/fa6";
import { unlinkModule } from "./delete-module.action";
import { useTransition } from "react";

export function UnlinkModuleButton({
  moduleId,
  parentModuleId,
  onUnlink,
}: {
  moduleId: string;
  parentModuleId: string;
  onUnlink: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Popconfirm
      placement="left"
      title="Tem certeza que deseja desvincular esse módulo do módulo pai?"
      onConfirm={() => {
        startTransition(() => {
          unlinkModule(moduleId, parentModuleId).then(onUnlink);
        });
      }}
      okText="Sim"
      cancelText="Não"
    >
      <Button
        type="text"
        disabled={isPending}
        loading={isPending}
        icon={<FaLinkSlash />}
        style={{
          width: "100%",
          justifyContent: "flex-start",
          padding: "0 12px",
        }}
      >
        Desvincular
      </Button>
    </Popconfirm>
  );
}
