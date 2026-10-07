"use client";

import { Button, Flex, Modal, ModalProps, Typography } from "antd";
import { ReactNode } from "react";

interface AppConfirmModalProps extends ModalProps {
  title: string;
  content: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  visible: boolean;
  isDeclined?: boolean;
  confirmDisabled?: boolean;
  useModalHeader?: boolean;
}

export function AppConfirmModal({
  title,
  content,
  onConfirm,
  onCancel,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  visible,
  isDeclined = false,
  confirmDisabled = false,
  useModalHeader = false,
  ...modalProps
}: AppConfirmModalProps) {
  const { Text } = Typography;

  return (
    <Modal
      title={useModalHeader ? title : null}
      open={visible}
      onCancel={onCancel}
      footer={null}
      centered
      {...modalProps}
    >
      {!useModalHeader && <Text
        strong
        style={{ fontSize: 18, textAlign: "center" }}
      >
        {title}
      </Text>}
      <div style={{ marginTop: 32, marginBottom: 32, textAlign: "center" }}>
        {content}
      </div>
      <Flex
        justify="end"
        gap={8}
      >
        <Button
          onClick={onCancel}
          size="large"
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          danger={isDeclined}
          disabled={confirmDisabled}
          size="large"
        >
          {confirmText}
        </Button>
      </Flex>
    </Modal>
  );
}
