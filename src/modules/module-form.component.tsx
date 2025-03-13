"use client";

import { Button, Flex, Input, Typography } from "antd";

import { FaFolderTree } from "react-icons/fa6";
import { MODULE_FORM_ID } from "./module-form.constant";
import { ModuleViewModel } from "@/model/module.model";
import { ModulesTree } from "./tree/modules-tree.component";
import Title from "antd/es/typography/Title";
import { loadChildrenModules } from "./tree/load-modules.action";
import { useCreateModule } from "./create/create-module.context";
import { useState } from "react";
import { useUpdateModule } from "./update/update-module.context";

export interface ModuleFormProps {
  id: string;
  name: string;
  childModules: ModuleViewModel[];
}

export function ModuleForm(props: ModuleFormProps) {
  const { updateModule, error, isPending } = useUpdateModule();
  const { openCreateModal } = useCreateModule();

  const [name, setName] = useState(props.name);

  return (
    <form
      id={MODULE_FORM_ID}
      action={() => updateModule({ id: props.id, name })}
    >
      <Flex vertical gap={8}>
        <label>
          <Title level={5}>Nome do módulo</Title>
          <Input
            disabled={isPending}
            onChange={(ev) => setName(ev.target.value)}
            defaultValue={name}
          />
          {error && <Typography.Text type="danger">{error}</Typography.Text>}
        </label>
        <label>
          <Title level={5}>Nome do módulo</Title>
          {props.childModules && (
            <ModulesTree
              modules={props.childModules}
              loadData={loadChildrenModules}
            />
          )}
        </label>
        <Button
          onClick={() => openCreateModal({ id: props.id, name })}
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
