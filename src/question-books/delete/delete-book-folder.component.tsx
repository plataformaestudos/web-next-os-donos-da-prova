"use client";

import { Button, Popconfirm, App } from "antd";

import { FaTrash } from "react-icons/fa6";
import { useTransition } from "react";
import { deleteBookFolder } from "./delete-book-folder.action";

export function DeleteBookFolderButton({
    folderId,
    onDelete,
}: {
    folderId: string;
    onDelete: () => void;
}) {
    const [isPending, startTransition] = useTransition();
    const app = App.useApp?.();
    const message = app?.message;
    const handleConfirm = () => {
        startTransition(async () => {
            try {
                const res = await deleteBookFolder(folderId);
                if (res.success) {
                    message?.success("Pasta de cadernos deletada com sucesso!");
                    onDelete?.();
                } else {
                    message?.error(res.error ?? "Erro ao deletar a pasta de cadernos");

                }
            } catch (err: unknown) {
                const text = err instanceof Error ? err.message : "Erro inesperado ao deletar pasta de cadernos";
                message?.error(text);

            }
        });
    };

    return (
        <Popconfirm
            placement="left"
            title="Tem certeza que deseja apagar essa pasta e todos os cadernos dentro dela?"
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
            >
                Apagar
            </Button>
        </Popconfirm>
    );
}
