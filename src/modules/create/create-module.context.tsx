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
import { createModule } from "./create-module.action";

const CreateModuleContext = createContext(
  {} as {
    openCreateModal: (
      parentModule: { id: string; name: string } | null
    ) => void;
  }
);

export const CreateModuleProvider = ({ children }: PropsWithChildren) => {
  const { message } = App.useApp();

  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [parentModuleId, setParentModuleId] = useState<string | null>(null);
  const [parentModuleName, setParentModuleName] = useState<string | null>(null);

  const openCreateModal = useCallback(
    (parentModule: { id: string; name: string } | null) => {
      setIsOpen(true);
      setParentModuleId(parentModule?.id || null);
      setParentModuleName(parentModule?.name || null);
    },
    []
  );

  const resetState = () => {
    setName("");
    setIsOpen(false);
    setError(null);
    setParentModuleId(null);
    setParentModuleName(null);
  };

  return (
    <CreateModuleContext.Provider value={{ openCreateModal }}>
      {children}
      <Modal
        destroyOnClose
        title={
          parentModuleName ? (
            <Flex vertical>
              <Typography.Text
                type="secondary"
                style={{ fontSize: 12, fontWeight: "normal" }}
              >
                {parentModuleName}
              </Typography.Text>
              <Title level={5} style={{ margin: 0 }}>
                Adicionar módulo filho
              </Title>
            </Flex>
          ) : (
            "Criar módulo"
          )
        }
        open={isOpen}
        okButtonProps={{
          loading: isPending,
          disabled: !name || isPending,
        }}
        onOk={() => {
          startTransition(() => {
            createModule({
              parentModuleId,
              name,
            }).then(({ error }) => {
              if (error) {
                setError(error);
              } else {
                message.success("Módulo criado com sucesso!");
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
            placeholder="Módulo"
            value={name}
            onChange={(ev) => setName(ev.target.value)}
          />
        </Flex>
        {error && <Typography.Text type="danger">{error}</Typography.Text>}
      </Modal>
    </CreateModuleContext.Provider>
  );
};

export function useCreateModule() {
  return useContext(CreateModuleContext);
}
