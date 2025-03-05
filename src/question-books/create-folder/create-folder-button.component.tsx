"use client";

import { Button } from "antd";
import { LuFolder } from "react-icons/lu";
import { useCreateFolder } from "./create-folder.context";

export function CreateFolderButton() {
  const { openCreateFolderModal } = useCreateFolder();

  return (
    <Button
      type="primary"
      size="large"
      onClick={() => openCreateFolderModal()}
      icon={<LuFolder />}
    >
      Criar pasta
    </Button>
  );
}
