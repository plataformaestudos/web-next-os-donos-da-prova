"use client";

import { Button, Popconfirm, App } from "antd";

import { FaTrash } from "react-icons/fa6";
import { deleteQuestionBook } from "./delete-question-book.action";
import { useTransition } from "react";

export function DeleteQuestionBookButton({
    questionBookId,
    onDelete,
}: {
    questionBookId: string;
    onDelete: () => void;
}) {
    const [isPending, startTransition] = useTransition();
    const app = App.useApp?.();
    const message = app?.message;
    const handleConfirm = () => {
        startTransition(async () => {
            try {
                const res = await deleteQuestionBook(questionBookId);
                if (res.success) {
                    message?.success("Caderno de questões deletado com sucesso!");
                    onDelete?.();
                } else {
                    message?.error(res.error ?? "Erro ao deletar o caderno de questões");

                }
            } catch (err: unknown) {
                const text = err instanceof Error ? err.message : "Erro inesperado ao deletar caderno de questões";
                message?.error(text);

            }
        });
    };

    return (
        <Popconfirm
            placement="left"
            title="Tem certeza que deseja apagar esse caderno?"
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
