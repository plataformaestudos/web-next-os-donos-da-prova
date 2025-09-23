"use client";

import { Button, Divider, Dropdown, Flex, Input, List, Modal, Typography, App } from "antd";

import Link from "next/link";
import { LuFolderOpen } from "react-icons/lu";
import Title from "antd/es/typography/Title";
import { plural } from "@/util/text.util";
import styled from "styled-components";
import { EditOutlined, EllipsisOutlined } from "@ant-design/icons";
import { useEffect, useState, useTransition } from "react";
import { DeleteBookFolderButton } from "../delete/delete-book-folder.component";
import { editBookFolder } from "../edit-book-folder.action";

interface ListFoldersProps {
    folders: {
        id: string;
        name: string;
        nrOfQuestionBooks: number;
    }[];
}

export function ListFolders({ folders }: ListFoldersProps) {
    const { message } = App.useApp();
    const [dropdownOpened, setDropdownOpened] = useState<string | null>(null);
    const [items, setItems] = useState(folders);

    useEffect(() => {
        setItems(folders);
    }, [folders]);

    const [name, setName] = useState("");
    const [editingBookFolder, setEditingBookFolder] = useState<{
        id: string;
        name: string;
    } | null>(null);
    const [isPending, startTransition] = useTransition();
    const onClose = () => {
        setName("");
        setEditingBookFolder(null);
    }
    const handleDelete = (id: string) => {
        setItems((prev) => prev.filter((q) => q.id !== id));
    };
    const [error, setError] = useState<string | null>(null);
    return (
        <>
            <List
                dataSource={items}
                renderItem={(item) => (
                    <Folder>
                        <Flex align="center" gap={16}>
                            <LuFolderOpen size={24} />
                            <Link href={`/question-books?pasta=${item.id}`}>
                                <Title level={5}>{item.name}</Title>
                            </Link>
                        </Flex>
                        <Flex align="center" gap={12}>
                            <span>{plural("caderno", "cadernos", item.nrOfQuestionBooks)}</span>
                            <Dropdown
                                open={dropdownOpened === item.id}
                                onOpenChange={(open) => setDropdownOpened(open ? item.id : null)}
                                menu={{
                                    items: [
                                        {
                                            key: "rename",
                                            icon: <EditOutlined />,
                                            label: "Renomear",
                                            onClick: () => {
                                                setName(item.name);
                                                setEditingBookFolder(item);
                                            },
                                        },
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
                                                <DeleteBookFolderButton
                                                    folderId={item.id}
                                                    onDelete={() => {
                                                        handleDelete(item.id);
                                                        setDropdownOpened(null);
                                                    }}
                                                />
                                            ),
                                        },
                                    ],
                                }}
                                trigger={["click"]}
                            >
                                <span>
                                    <Button size="small" icon={<EllipsisOutlined />} />
                                </span>
                            </Dropdown>
                        </Flex>
                    </Folder>
                )}
            />
            <Modal
                destroyOnHidden
                title={
                    <Flex vertical>
                        <Typography.Text
                            type="secondary"
                            style={{ fontSize: 12, fontWeight: "normal" }}
                        >
                            {editingBookFolder?.name}
                        </Typography.Text>
                        <Title level={5} style={{ margin: 0 }}>
                            Editar pasta
                        </Title>
                    </Flex>
                }
                open={editingBookFolder !== null}
                okButtonProps={{
                    loading: isPending,
                    disabled: !name || isPending,
                }}
                onOk={() => {
                    startTransition(() => {
                        editBookFolder({
                            id: editingBookFolder?.id as string,
                            name,
                        }).then(({ error }) => {
                            if (error) {
                                setError(error);
                            } else {
                                message.success("Pasta renomeada com sucesso!");
                                setItems((prev) => prev.map((it) => (it.id === editingBookFolder?.id ? { ...it, name } : it)));
                                onClose();
                            }
                        });
                    });
                }}
                onCancel={onClose}
            >
                <Divider style={{ margin: "12px 0" }} />
                <Flex vertical gap={12}>
                    <Title level={5} style={{ margin: 0 }}>
                        Nome
                    </Title>
                    <Input
                        placeholder="Minha Pasta"
                        value={name}
                        onChange={(ev) => setName(ev.target.value)}
                    />
                </Flex>
                {error && <Typography.Text type="danger">{error}</Typography.Text>}
            </Modal>
        </>

    );
}

const Folder = styled(List.Item)`
  display: flex;
  align-items: center;

  padding: 16px 24px !important;
  margin-bottom: 4px;
  border-radius: 6px;
  background-color: ${({ theme }) => theme.colorBgContainer};

  h5 {
    margin: 0 !important;
  }

  a:hover {
    text-decoration: underline;
    text-decoration-color: ${({ theme }) => theme.colorText};
    text-decoration-thickness: 2px;
  }
`;
