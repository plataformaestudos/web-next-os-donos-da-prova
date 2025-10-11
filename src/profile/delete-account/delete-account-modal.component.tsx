"use client";

import { Button, Flex, Modal, Typography, Input } from "antd";
import { useState } from "react";

interface DeleteAccountModalProps {
    visible: boolean;
    onCancel: () => void;
    onConfirm: (reason?: string) => void;
    loading?: boolean;
}

export function DeleteAccountModal({
    visible,
    onCancel,
    onConfirm,
    loading = false,
}: DeleteAccountModalProps) {
    const [reason, setReason] = useState<string>("");
    const { Text, Paragraph } = Typography;
    const { TextArea } = Input;

    const handleConfirm = () => {
        onConfirm(reason.trim() || undefined);
    };

    const handleCancel = () => {
        setReason("");
        onCancel();
    };

    return (
        <Modal
            title={null}
            open={visible}
            onCancel={handleCancel}
            footer={null}
            centered
            width={500}
        >
            <Text
                strong
                style={{ fontSize: 18, textAlign: "center", display: "block", marginBottom: 16 }}
            >
                Excluir Conta Permanentemente
            </Text>
            
            <Paragraph style={{ textAlign: "center", marginBottom: 24 }}>
                <Text type="danger" strong style={{ fontSize: 15 }}>
                    Esta ação é irreversível!
                </Text>
                <br />
                <br />
                Tem certeza que deseja excluir sua conta permanentemente? Todos os seus dados serão perdidos e não poderão ser recuperados.
            </Paragraph>

            <div style={{ marginBottom: 24 }}>
                <Text strong style={{ marginBottom: 8, display: "block" }}>
                    Nos ajude a ficar melhor, nos conte porque deseja excluir a conta:
                </Text>
                <TextArea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Digite aqui o motivo da exclusão (opcional)..."
                    rows={4}
                    maxLength={500}
                    showCount
                />
            </div>

            <Flex justify="end" gap={8}>
                <Button
                    onClick={handleCancel}
                    size="large"
                    disabled={loading}
                >
                    Cancelar
                </Button>
                <Button
                    onClick={handleConfirm}
                    danger
                    size="large"
                    loading={loading}
                >
                    Excluir Conta
                </Button>
            </Flex>
        </Modal>
    );
}
