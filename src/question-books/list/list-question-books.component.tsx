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
  Typography,
} from "antd";
import { EditOutlined, EllipsisOutlined } from "@ant-design/icons";
import { useState, useTransition } from "react";

import { DeleteQuestionBookButton } from "../delete/delete-question-book.component";
import Link from "next/link";
import { LuBook } from "react-icons/lu";
import Title from "antd/es/typography/Title";
import { editQuestionBook } from "../edit-question-book.action";
import styled from "styled-components";

interface ListQuestionBooksProps {
  questionBooks: {
    id: string;
    name: string;
  }[];
}

export function ListQuestionBooks({ questionBooks }: ListQuestionBooksProps) {
  const { message } = App.useApp();

  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

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

  return (
    <>
      <List
        dataSource={questionBooks}
        renderItem={(item) => (
          <QuestionBook>
            <Flex align="center" gap={16}>
              <LuBook size={24} />
              <Link href={`/question-books/${item.id}`}>
                <Title level={5}>{item.name}</Title>
              </Link>
            </Flex>

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
                        onDelete={() => setDropdownOpened(null)}
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
