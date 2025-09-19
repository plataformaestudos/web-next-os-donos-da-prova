"use client";

import { Button, Flex, Input, Typography, Select } from "antd";

import { FaFolderTree } from "react-icons/fa6";
import { MODULE_FORM_ID } from "./module-form.constant";
import { ModuleEntitie, ModuleViewModel } from "@/model/module.model";
import { ModulesTree } from "./tree/modules-tree.component";
import Title from "antd/es/typography/Title";
import { loadChildrenModules } from "./tree/load-modules.action";
import { useCreateModule } from "./create/create-module.context";
import { useState } from "react";
import { useUpdateModule } from "./update/update-module.context";

export interface ModuleFormProps {
    id: string;
    name: string;
    parentModuleId?: string | null;
    childModules: ModuleViewModel[];
}

export function ModuleForm(props: ModuleFormProps & { allModules: ModuleEntitie[] }) {
    const { updateModule, error, isPending } = useUpdateModule();
    const { openCreateModal } = useCreateModule();
    const [name, setName] = useState(props.name);
    const [parentModuleId, setParentModuleId] = useState<string | null>(props.parentModuleId || null);
    const [search, setSearch] = useState("");
    const allModules = props.allModules || [];
    const filteredModules = allModules.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()));


    return (
        <form
            id={MODULE_FORM_ID}
            action={() => updateModule({ id: props.id, name, parentModuleId })}
        >
            <Flex vertical gap={8}>
                <label>
                    <Title level={4}>Nome do módulo</Title>
                    <Input
                        disabled={isPending}
                        onChange={(ev) => setName(ev.target.value)}
                        defaultValue={name}
                    />
                    {error && <Typography.Text type="danger">{error}</Typography.Text>}
                </label>

                <label>
                    <Title level={4}>Parent Module</Title>
                    <Select
                        showSearch
                        disabled={isPending}
                        placeholder="Selecione o módulo pai"
                        onSearch={(val) => setSearch(val)}
                        filterOption={false}
                        value={parentModuleId || ""}
                        onChange={(val) => setParentModuleId(val || null)}
                        options={[
                            { label: "Nenhum (Root)", value: "" },
                            ...filteredModules.map((m) => ({ label: m.name, value: m.id })),
                        ]}
                        style={{ width: 300 }}
                    />
                </label>
                <label>
                    <Title level={4}>Submódulos</Title>
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
