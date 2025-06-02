"use client";

import { App, Divider, Flex, Input, Modal, Typography } from "antd";
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useState,
  useTransition,
} from "react";

import Title from "antd/es/typography/Title";
import { createFolder } from "./create-folder.action";

const CreateFolderContext = createContext(
  {} as {
    openCreateFolderModal: () => void;
  }
);

export const CreateFolderProvider = ({ children }: PropsWithChildren) => {
  const { message } = App.useApp();

  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [isOpen, setIsOpen] = useState(false);

  const openCreateFolderModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  const resetState = () => {
    setName("");
    setIsOpen(false);
    setError(null);
  };

  return (
    <CreateFolderContext.Provider value={{ openCreateFolderModal }}>
      {children}
      <Modal
        destroyOnHidden
        title="Criar pasta"
        open={isOpen}
        okButtonProps={{
          loading: isPending,
          disabled: !name || isPending,
        }}
        onOk={() => {
          startTransition(() => {
            createFolder({
              name,
            }).then(({ error }) => {
              if (error) {
                setError(error);
              } else {
                message.success("Pasta criado com sucesso!");
                resetState();
              }
            });
          });
        }}
        onCancel={() => {
          resetState();
        }}
      >
        <Divider style={{ margin: "12px 0" }} />
        <Flex vertical gap={12}>
          <Title level={5} style={{ margin: 0 }}>
            Nome
          </Title>
          <Input
            placeholder="Pasta"
            value={name}
            onChange={(ev) => setName(ev.target.value)}
          />
        </Flex>
        {error && <Typography.Text type="danger">{error}</Typography.Text>}
      </Modal>
    </CreateFolderContext.Provider>
  );
};

export function useCreateFolder() {
  return useContext(CreateFolderContext);
}
