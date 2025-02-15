"use client";

import { Button, Dropdown, Flex, Input } from "antd";
import { Module, ModulesTree } from "./modules-tree.component";

import { FaFolderTree } from "react-icons/fa6";
import Title from "antd/es/typography/Title";
import { loadChildrenModules } from "./load-modules.action";
import { useCreateModule } from "./create/create-module.context";

export interface ModuleFormProps {
  id?: string;
  name?: string;
  childModules: Module[];
}

export function ModuleForm({ id, name, childModules }: ModuleFormProps) {
  const { openCreateModal } = useCreateModule();

  return (
    <form action="">
      <Flex vertical gap={8}>
        <label>
          <Title level={5}>Nome do módulo</Title>
          <Input defaultValue={name} />
        </label>
        <label>
          <Title level={5}>Nome do módulo</Title>
          {childModules && (
            <ModulesTree
              modules={childModules}
              loadData={loadChildrenModules}
            />
          )}
        </label>
        <Button
          onClick={() => openCreateModal(id && name ? { id, name } : null)}
          type="text"
          icon={<FaFolderTree />}
          style={{ alignSelf: "flex-start" }}
        >
          Adicionar módulo filho
        </Button>
      </Flex>
    </form>
  );
}
