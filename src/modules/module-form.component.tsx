"use client";

import { Button, Divider, Dropdown, Flex, Input } from "antd";
import { Module, ModulesTree } from "./modules-tree.component";

import { FaFolderTree } from "react-icons/fa6";
import Title from "antd/es/typography/Title";
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
              loadData={async function loadData(key: string) {
                console.log(key);
                return Promise.resolve([]);
              }}
            />
          )}
        </label>
        <Dropdown
          menu={{
            onClick: () => openCreateModal(id || null),
            items: [
              {
                key: "new",
                label: "Criar um novo módulo",
              },
              {
                key: "use-exisiting",
                label: "Buscar um módulo",
              },
            ],
          }}
        >
          <Button
            type="text"
            icon={<FaFolderTree />}
            style={{ alignSelf: "flex-start" }}
          >
            Adicionar módulo filho
          </Button>
        </Dropdown>
      </Flex>
    </form>
  );
}
