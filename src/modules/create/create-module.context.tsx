"use client";

import { App, Divider, Input, Modal, Typography } from "antd";
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

// const { Text } = Typography;

const CreateModuleContext = createContext(
  {} as {
    openCreateModal: (parentModuleId: string | null) => void;
  }
);

export const CreateModuleProvider = ({ children }: PropsWithChildren) => {
  const { message } = App.useApp();

  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [parentModuleId, setParentModuleId] = useState<string | null>(null);

  const openCreateModal = useCallback((parentModuleId: string | null) => {
    setIsOpen(true);
    setParentModuleId(parentModuleId);
  }, []);

  return (
    <CreateModuleContext.Provider value={{ openCreateModal }}>
      {children}
      <Modal
        title="Criar módulo"
        open={isOpen}
        okButtonProps={{
          loading: isPending,
          disabled: !name || isPending,
        }}
        onOk={() => {
          startTransition(() => {
            createModule({
              parent_module_id: parentModuleId,
              name,
            }).then(({ error }) => {
              if (error) {
                setError(error);
              } else {
                message.success("Módulo criado com sucesso!");
                setError(null);
                setName("");
                setIsOpen(false);
              }
            });
          });
        }}
        onCancel={() => {
          setIsOpen(false);
        }}
      >
        <Divider style={{ margin: "12px 0" }} />
        <Title level={5} style={{ marginTop: 0 }}>
          Nome
        </Title>
        <Input value={name} onChange={(ev) => setName(ev.target.value)} />
        {error && <Typography.Text type="danger">{error}</Typography.Text>}
      </Modal>
    </CreateModuleContext.Provider>
  );
};

export function useCreateModule() {
  return useContext(CreateModuleContext);
}
