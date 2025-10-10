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
    Progress,
    Select,
    Tooltip,
    Typography,
} from "antd";
import { EditOutlined, EllipsisOutlined, StarFilled, StarOutlined } from "@ant-design/icons";
import { useEffect, useState, useTransition } from "react";
import { DefaultTheme, useTheme } from "styled-components";
import { DeleteQuestionBookButton } from "../delete/delete-question-book.component";
import Link from "next/link";
import { LuBook, LuFolderPen } from "react-icons/lu";
import Title from "antd/es/typography/Title";
import { editQuestionBook } from "../edit-question-book.action";
import styled from "styled-components";
import { BookFolderModel, QuestionBookBookFolderModel } from "../book-folder.model";
import { favoriteQuestionBook } from "../update/favorite-question-book.action";

interface ListQuestionBooksProps {
    questionBooks: QuestionBookBookFolderModel[];
    folders: BookFolderModel[];
    setQuestionBooksWithoutFolder?: React.Dispatch<React.SetStateAction<QuestionBookBookFolderModel[]>>;
}

export function ListQuestionBooks({ questionBooks, folders, setQuestionBooksWithoutFolder }: ListQuestionBooksProps) {
    const { message } = App.useApp();
    const styledTheme: DefaultTheme = useTheme();
    const [isPending, startTransition] = useTransition();
    const [items, setItems] = useState(questionBooks);
    const primaryColor = styledTheme.colorPrimary;
    const [name, setName] = useState("");
    const [error, setError] = useState<string | null>(null);

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);

        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    const handleDelete = (id: string) => {
        setItems((prev) => prev.filter((q) => q.id !== id));
    };
    const [editingQuestionBook, setEditingQuestionBook] = useState<{
        id: string;
        name: string;
    } | null>(null);
    const [dropdownOpened, setDropdownOpened] = useState<string | null>(null);

    const [movingQuestionBook, setMovingQuestionBook] = useState<QuestionBookBookFolderModel | null>(null);
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

    const getBookFolderId = (item: QuestionBookBookFolderModel) => {
        return item.folderId ?? null;
    };


    const handleMoveSave = () => {
        if (!movingQuestionBook) return;
        const bookId = movingQuestionBook.id;
        const targetFolderId = selectedFolderId ?? null;
        startTransition(() => {
            editQuestionBook({
                id: bookId,
                name: movingQuestionBook.name,
                folderId: targetFolderId,
            }).then(({ error }) => {
                if (error) {
                    setError(error);
                } else {
                    message.success("Caderno movido com sucesso!");
                    const currentFolderId = getBookFolderId(movingQuestionBook);
                    if (currentFolderId !== targetFolderId) {
                        setItems((prev) => prev.filter((it) => it.id !== bookId));
                        if (!targetFolderId && setQuestionBooksWithoutFolder) {
                            if (!targetFolderId && setQuestionBooksWithoutFolder) {
                                setQuestionBooksWithoutFolder(prev => [
                                    ...prev,
                                    { ...movingQuestionBook, folderId: undefined }
                                ]);
                            }

                        }
                    } else {
                        setItems((prev) => prev.map((it) => (it.id === bookId ? { ...it, bookFolderId: targetFolderId } : it)));
                    }
                    setMovingQuestionBook(null);
                    setSelectedFolderId(null);
                    setError(null);
                }
            });
        });
    };

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
                            {!isMobile && (
                                <Tooltip title={`${item.nrOfAnsweredQuestions} de ${item.questionsCount} questões (${item.percentAnswered}%)`}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <Progress
                                            percent={Math.max(0, Math.min(100, Number(item.percentAnswered || 0)))}
                                            strokeColor={item.percentAnswered === 100 ? '#52c41a' : primaryColor}
                                            showInfo={false}
                                            strokeWidth={8}
                                            style={{ width: 120 }}
                                        />
                                        <Typography.Text style={{ minWidth: 40, textAlign: 'center', fontSize: 14, fontWeight: '700' }}>
                                            {item.questionsCount > 0 ? `${item.percentAnswered}%` : "0%"}
                                        </Typography.Text>
                                    </div>
                                </Tooltip>
                            )}
                            <Dropdown
                                open={dropdownOpened === item.id}
                                onOpenChange={(open) => setDropdownOpened(open ? item.id : null)}
                                menu={{
                                    items: [
                                        {
                                            key: "change",
                                            icon: <LuFolderPen />,
                                            label: "Mover",
                                            onClick: () => {
                                                setMovingQuestionBook(item);
                                                setSelectedFolderId(getBookFolderId(item));
                                            },
                                        },
                                        {
                                            type: "divider",
                                        },
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
            <Modal
                destroyOnHidden
                title={
                    <Flex vertical>
                        <Typography.Text type="secondary" style={{ fontSize: 12, fontWeight: "normal" }}>
                            {movingQuestionBook?.name}
                        </Typography.Text>
                        <Title level={5} style={{ margin: 0 }}>
                            Mover caderno
                        </Title>
                    </Flex>
                }
                open={movingQuestionBook !== null}
                okButtonProps={{
                    loading: isPending,
                    disabled: isPending,
                }}
                onOk={handleMoveSave}
                onCancel={() => {
                    setMovingQuestionBook(null);
                    setSelectedFolderId(null);
                    setError(null);
                }}
            >
                <Divider style={{ margin: "12px 0" }} />
                <Flex vertical gap={12}>
                    <Title level={5} style={{ margin: 0 }}>
                        Selecionar pasta
                    </Title>

                    <Select
                        showSearch
                        placeholder="Selecione uma pasta"
                        value={selectedFolderId ?? undefined}
                        onChange={(val) => setSelectedFolderId(val ?? null)}
                        options={[
                            { label: "Nenhuma", value: "" },
                            ...folders.map((f) => ({ label: f.name, value: f.id })),
                        ]}
                        allowClear
                        filterOption={(input, option) =>
                            (option?.label ?? "").toString().toLowerCase().includes(input.toLowerCase())
                        }
                        style={{ width: "100%" }}
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
