"use client";

import { Alert, App, Button, Modal, Space, Typography } from "antd";
import { FaTrash } from "react-icons/fa6";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/app/context/user.context";
import { canAccess, Roles } from "@/util/roles";
import { deleteModule, loadModuleDeletionImpact } from "./delete-module.action";
import type { ModuleDeletionImpact } from "./module-deletion.model";

export function DeleteModuleButton({ moduleId, onDelete }: {
    moduleId: string;
    onDelete: () => void;
}) {
    const { user } = useUser();
    const { message } = App.useApp();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [impact, setImpact] = useState<ModuleDeletionImpact | null>(null);
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    if (!canAccess(user, [Roles.ADMIN])) return null;

    const load = async () => {
        setLoading(true);
        try { setImpact(await loadModuleDeletionImpact(moduleId)); }
        catch (error) { message.error(error instanceof Error ? error.message : "Não foi possível consultar o impacto da exclusão."); }
        finally { setLoading(false); }
    };
    const confirm = async () => {
        if (!impact || deleting || impact.blockedByImports) return;
        setDeleting(true);
        try {
            const result = await deleteModule(moduleId, impact.confirmationToken);
            if (!result.success) {
                message.error(result.error ?? "Não foi possível excluir o módulo.");
                setImpact(null);
                await load();
                return;
            }
            setImpact(null);
            await queryClient.invalidateQueries();
            message.success("Módulo e conteúdo exclusivo excluídos definitivamente.");
            onDelete();
            router.refresh();
        } finally { setDeleting(false); }
    };
    return <>
        <Button type="link" danger loading={loading} disabled={deleting}
            icon={<FaTrash />} style={{ width: "100%", justifyContent: "flex-start", padding: "0 12px" }}
            onClick={(event) => { event.stopPropagation(); void load(); }}>
            Apagar
        </Button>
        <Modal title="Excluir módulo definitivamente" open={Boolean(impact)}
            onCancel={() => { if (!deleting) setImpact(null); }}
            onOk={() => void confirm()} okText="Excluir definitivamente" cancelText="Cancelar"
            confirmLoading={deleting} closable={!deleting} maskClosable={!deleting}
            cancelButtonProps={{ disabled: deleting }}
            okButtonProps={{ danger: true, disabled: !impact || impact.blockedByImports }}>
            {impact && <Space direction="vertical" style={{ width: "100%" }}>
                <Typography.Paragraph>Você está excluindo <strong>{impact.moduleName}</strong> e todo o conteúdo exclusivo da árvore.</Typography.Paragraph>
                <ul>
                    <li>{impact.modules} módulo(s), incluindo os submódulos.</li>
                    <li>{impact.questions} questão(ões), com alternativas, comentários e votos.</li>
                    <li>{impact.bookItems} item(ns) em {impact.questionBooks} caderno(s).</li>
                    <li>{impact.answers} resposta(s) de alunos.</li>
                </ul>
                {impact.sharedQuestions > 0 && <Typography.Paragraph>{impact.sharedQuestions} questão(ões) compartilhada(s) com outros módulos serão preservadas.</Typography.Paragraph>}
                <Typography.Paragraph>Rascunhos de importação relacionados serão encerrados. O histórico das importações será preservado.</Typography.Paragraph>
                <Alert type="warning" showIcon message="Esta ação não pode ser desfeita."
                    description="O histórico e as estatísticas dos alunos serão alterados. Os cadernos serão mantidos e podem ficar vazios." />
                {impact.blockedByImports && <Alert type="info" showIcon message="Há uma importação em andamento nesta árvore. Aguarde sua conclusão e consulte o impacto novamente." />}
            </Space>}
        </Modal>
    </>;
}
