"use client";

import {
    App,
    Button,
    Divider,
    Dropdown,
    Flex,
    Input,
    List,
    Modal,
    Tooltip,
    Typography,
} from "antd";
import { EditOutlined, EllipsisOutlined, StarFilled, StarOutlined } from "@ant-design/icons";
import { useState, useTransition } from "react";

import { DeleteQuestionBookButton } from "../delete/delete-question-book.component";
import Link from "next/link";
import { LuBook } from "react-icons/lu";
import Title from "antd/es/typography/Title";
import { editQuestionBook } from "../edit-question-book.action";
import styled from "styled-components";
import { QuestionBookBookFolderModel } from "../book-folder.model";
import { favoriteQuestionBook } from "../update/favorite-question-book.action";

interface ListQuestionBooksProps {
    questionBooks: QuestionBookBookFolderModel[];
}

export function ListQuestionBooks({ questionBooks }: ListQuestionBooksProps) {
    const { message } = App.useApp();

    const [isPending, startTransition] = useTransition();
    const [items, setItems] = useState(questionBooks);

    const [name, setName] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleDelete = (id: string) => {
        setItems((prev) => prev.filter((q) => q.id !== id));
    };
    const [editingQuestionBook, setEditingQuestionBook] = useState<{
        id: string;
        name: string;
    } | null>(null);
    const [dropdownOpened, setDropdownOpened] = useState<string | null>(null);

    const onClose = () => {
        setName("");
        setError(null);
        setEditingQuestionBook(null);
    };
    const toggleFavorite = (id: string) => {
        const idx = items.findIndex((i) => i.id === id);
        if (idx === -1) return;
        const current = items[idx];
        const nextFav = !current.favorite;

        startTransition(async () => {
            try {
                const res = await favoriteQuestionBook({ questionBookId: id });

                if (!res.success) {
                    message?.error(res.error ?? "Erro ao atualizar favorito");
                    return;
                }

                setItems((prev) => prev.map((it) => (it.id === id ? { ...it, favorite: nextFav } : it)));
                message?.success(nextFav ? "Adicionado aos favoritos" : "Removido dos favoritos");
            } catch (err: unknown) {
                message?.error(err instanceof Error ? err.message : "Erro ao atualizar favorito");
            }
        });
    };
    return (
        <>
            <List
                dataSource={items}
                renderItem={(item) => (
                    <QuestionBook>
                        <Flex align="center" gap={16}>
                            <LuBook size={24} />
                            <Link href={`/question-books/${item.id}`}>
                                <Title level={5}>{item.name}</Title>
                            </Link>
                        </Flex>

                        <Flex align="center" gap={8}>

                            <Tooltip title={item.favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}>
                                <Button
                                    type="text"
                                    icon={item.favorite ? <StarFilled style={{ fontSize: 18 }} /> : <StarOutlined style={{ fontSize: 18 }} />}
                                    onClick={() => toggleFavorite(item.id)}
                                />
                            </Tooltip>

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
                                                setEditingQuestionBook(item);
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
                                                <DeleteQuestionBookButton
                                                    questionBookId={item.id}
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
                    </QuestionBook>
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
                            {editingQuestionBook?.name}
                        </Typography.Text>
                        <Title level={5} style={{ margin: 0 }}>
                            Editar caderno
                        </Title>
                    </Flex>
                }
                open={editingQuestionBook !== null}
                okButtonProps={{
                    loading: isPending,
                    disabled: !name || isPending,
                }}
                onOk={() => {
                    startTransition(() => {
                        editQuestionBook({
                            id: editingQuestionBook?.id as string,
                            name,
                        }).then(({ error }) => {
                            if (error) {
                                setError(error);
                            } else {
                                message.success("Caderno renomeado com sucesso!");
                                setItems((prev) => prev.map((it) => (it.id === editingQuestionBook?.id ? { ...it, name } : it)));
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
                        placeholder="Meu caderno"
                        value={name}
                        onChange={(ev) => setName(ev.target.value)}
                    />
                </Flex>
                {error && <Typography.Text type="danger">{error}</Typography.Text>}
            </Modal>
        </>
    );
}

const QuestionBook = styled(List.Item)`
  display: flex;
  align-items: center;
  justify-content: space-between;

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
