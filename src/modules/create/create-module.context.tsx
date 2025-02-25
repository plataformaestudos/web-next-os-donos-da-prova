"use client";

import { App, Divider, Flex, Input, Modal, Segmented, Typography } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useTransition,
} from "react";
import { assignModuleToParent, createModule } from "./create-module.action";

import { SearchModules } from "./search-modules.component";
import Title from "antd/es/typography/Title";

// const { Text } = Typography;

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
    setShowSearch(false);
  };

  const [showSearch, setShowSearch] = useState(!!parentModuleId);

  useEffect(() => {
    setShowSearch(!!parentModuleId);
  }, [parentModuleId]);

  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);

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
          disabled: (!name && !selectedModuleId) || isPending,
        }}
        onOk={() => {
          startTransition(() => {
            if (parentModuleId && selectedModuleId) {
              assignModuleToParent({
                moduleId: selectedModuleId,
                parentModuleId,
              }).then(({ error }) => {
                if (error) {
                  setError(error);
                } else {
                  message.success("Módulo vinculado com sucesso!");
                  resetState();
                }
              });
            } else {
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
            }
          });
        }}
        onCancel={() => {
          resetState();
        }}
      >
        <Divider style={{ margin: "12px 0" }} />
        <Flex vertical gap={12}>
          {!!parentModuleId && (
            <Segmented
              style={{ alignSelf: "flex-start" }}
              value={showSearch}
              options={[
                {
                  label: "Buscar um módulo existente",
                  value: true,
                  icon: <SearchOutlined />,
                },
                {
                  label: "Criar um novo módulo",
                  value: false,
                  icon: <PlusOutlined />,
                },
              ]}
              onChange={setShowSearch}
            />
          )}
          {showSearch && (
            <SearchModules
              moduleId={parentModuleId as string}
              onSelectModule={(moduleId) => setSelectedModuleId(moduleId)}
              onClickCreateNew={(name) => {
                setShowSearch(false);
                setName((oldName) => name ?? oldName);
              }}
            />
          )}
          {!showSearch && (
            <>
              <Title level={5} style={{ margin: 0 }}>
                Nome
              </Title>
              <Input
                placeholder="Módulo"
                value={name}
                onChange={(ev) => setName(ev.target.value)}
              />
            </>
          )}
        </Flex>
        {error && <Typography.Text type="danger">{error}</Typography.Text>}
      </Modal>
    </CreateModuleContext.Provider>
  );
};

export function useCreateModule() {
  return useContext(CreateModuleContext);
}
