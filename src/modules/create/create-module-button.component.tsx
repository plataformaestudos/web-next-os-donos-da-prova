"use client";

import { Button } from "antd";
import { useCreateModule } from "./create-module.context";

export function CreateModuleButton() {
  const { openCreateModal } = useCreateModule();

  return (
    <Button type="primary" size="large" onClick={() => openCreateModal(null)}>
      Criar módulo
    </Button>
  );
}
