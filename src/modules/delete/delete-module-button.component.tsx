"use client";

import { Button, Popconfirm, App } from "antd";

import { FaTrash } from "react-icons/fa6";
import { deleteModule } from "./delete-module.action";
import { useTransition } from "react";

export function DeleteModuleButton({
    moduleId,
    onDelete,
}: {
    moduleId: string;
    onDelete: () => void;
}) {
    const [isPending, startTransition] = useTransition();
    const app = App.useApp?.();
    const message = app?.message;
    const handleConfirm = () => {
        startTransition(async () => {
            try {
                const res = await deleteModule(moduleId); // server action
                if (res.success) {
                    message?.success("Módulo deletado com sucesso!");
                    onDelete?.();
                } else {
                    message?.error(res.error ?? "Erro ao deletar o módulo");

                }
            } catch (err: unknown) {
                const text = err instanceof Error ? err.message : "Erro inesperado ao deletar módulo";
                message?.error(text);

            }
        });
    };
    return (
        <Popconfirm
            placement="left"
            title="Tem certeza que deseja apagar esse módulo?"
            onConfirm={handleConfirm}
            okText="Sim"
            cancelText="Não"
        >
            <Button
                type="link"
                danger
                disabled={isPending}
                loading={isPending}
                icon={<FaTrash />}
                style={{
                    width: "100%",
                    justifyContent: "flex-start",
                    padding: "0 12px",
                }}
            >
                Apagar
            </Button>
        </Popconfirm>
    );
}
