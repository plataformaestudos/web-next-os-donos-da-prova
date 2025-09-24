import { Button, Dropdown, Flex } from "antd";
import {
    EditOutlined,
    EllipsisOutlined,
    PlusOutlined,
} from "@ant-design/icons";
import { useMemo, useState } from "react";

import { DeleteModuleButton } from "../delete/delete-module-button.component";
import { ItemType } from "antd/es/menu/interface";
import Link from "next/link";
import { LuFileQuestion } from "react-icons/lu";
import Title from "antd/es/typography/Title";
import { UnlinkModuleButton } from "../delete/unlink-module-button.component";
import { useCreateModule } from "../create/create-module.context";
import { plural } from "@/util/text.util";
import { GrFormViewHide } from "react-icons/gr";


export function ModuleTreeItemTitle({
    id,
    title,
    parentModuleId,
    isLeaf,
    readonly,
    numberQuestions,
    onClick,
}: {
    id: string;
    title: string;
    parentModuleId: string | null;
    isLeaf?: boolean;
    readonly?: boolean;
    numberQuestions: number;
    onClick?: () => void;
}) {
    const { openCreateModal } = useCreateModule();
    const [menuOpened, setMenuOpened] = useState(false);
    const [showQuestions, setShowQuestions] = useState(false);
    const toggleShowQuestions = (ev: React.MouseEvent) => {
        ev.stopPropagation();
        setShowQuestions(!showQuestions);
    };
    const items = useMemo(() => {
        const result: ItemType[] = [
            {
                key: "create",
                icon: <PlusOutlined />,
                label: "Adicionar módulo filho",
                onClick: () => openCreateModal({ id, name: title }),
            },
            {
                key: "edit",
                icon: <EditOutlined />,
                label: <Link href={`/modules/${id}`}>Editar</Link>,
            },
        ];

        if (isLeaf) {
            result.push({
                key: "open-questions",
                icon: <LuFileQuestion />,
                label: <Link href={`/questions?modulos=${id}`}>Questões</Link>,
            });
        }

        if (parentModuleId) {
            result.push({
                key: "unlink",
                style: {
                    padding: 0,
                },
                disabled: true,
                label: (
                    <UnlinkModuleButton
                        moduleId={id}
                        parentModuleId={parentModuleId}
                        onUnlink={() => setMenuOpened(false)}
                    />
                ),
            });
        }

        result.push(
            {
                type: "divider",
            },
            {
                key: "delete",
                style: {
                    padding: 0,
                },
                disabled: true,
                label: (
                    <DeleteModuleButton
                        moduleId={id}
                        onDelete={() => setMenuOpened(false)}
                    />
                ),
            }
        );
        return result;
    }, [id, title, parentModuleId, isLeaf, openCreateModal]);

    return (
        <Flex onClick={onClick} justify="space-between" align="center" style={{ minHeight: 32, cursor: "pointer", padding: "8px 0" }}>
            <Title level={5} style={{ margin: 0, flex: 1 }}>
                {title}
            </Title>

            {!readonly && (
                <Flex align="center" style={{ gap: 8, flexShrink: 0 }}>
                    {parentModuleId ? (
                        <span onClick={toggleShowQuestions} style={{ cursor: "pointer" }}>
                            {showQuestions ? plural("questão", "questões", numberQuestions) : <GrFormViewHide />
}
                        </span>
                    ) : (
                        <span>{plural("questão", "questões", numberQuestions)}</span>
                    )}
                    <Dropdown open={menuOpened} onOpenChange={setMenuOpened} menu={{ items }} trigger={["click"]}>
                        <span onClick={(ev) => ev.stopPropagation()}>
                            <Button size="small" icon={<EllipsisOutlined />} />
                        </span>
                    </Dropdown>
                </Flex>
            )}
        </Flex>


    );
}
