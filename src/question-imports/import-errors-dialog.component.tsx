"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  Button,
  Empty,
  Flex,
  List,
  Modal,
  Pagination,
  Segmented,
  Spin,
  Tag,
  Typography,
} from "antd";
import { useUser } from "@/app/context/user.context";
import { importErrorMessage, loadImportErrors } from "./question-import.api";
import { reviewLabels } from "./import-preview.rules";

const fields: Record<string, string> = {
  text: "Enunciado",
  comment: "Comentário",
  answer: "Resposta",
  alternatives: "Alternativas",
  type: "Tipo",
  difficultyLevel: "Dificuldade",
  modulePath: "Módulo",
  sourceNumber: "Número",
  document: "Documento",
  images: "Imagens",
};

export function ImportErrorsDialog({
  importId,
  onClose,
  onOpenItem,
}: {
  importId: string;
  onClose: () => void;
  onOpenItem: (id: string) => void;
}) {
  const { user } = useUser();
  const [severity, setSeverity] = useState<"ERROR" | "WARNING">("ERROR");
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: ["import-review", user?.id, importId, "errors", severity, page],
    queryFn: ({ signal }) => loadImportErrors(importId, severity, page, signal),
    retry: false,
  });
  return (
    <Modal
      open
      title="Erros e avisos da importação"
      onCancel={onClose}
      footer={<Button onClick={onClose}>Fechar</Button>}
      width={900}
    >
      <Flex vertical gap={16}>
        <Segmented<"ERROR" | "WARNING">
          value={severity}
          options={[
            { value: "ERROR", label: "Erros" },
            { value: "WARNING", label: "Avisos" },
          ]}
          onChange={(value) => {
            setSeverity(value);
            setPage(1);
          }}
        />
        {query.isPending && <Spin />}
        {query.isError && (
          <Alert
            showIcon
            type="error"
            message={importErrorMessage(query.error)}
            action={<Button onClick={() => query.refetch()}>Atualizar</Button>}
          />
        )}
        {!query.isError && query.data && (
          <>
            <Typography.Text>
              {query.data.total}{" "}
              {severity === "ERROR"
                ? "erros encontrados"
                : "avisos encontrados"}
              . Questões excluídas também aparecem nesta lista.
            </Typography.Text>
            <List
              dataSource={query.data.errors}
              locale={{
                emptyText: (
                  <Empty description="Nenhuma ocorrência encontrada" />
                ),
              }}
              renderItem={(problem) => (
                <List.Item>
                  <Flex vertical gap={8} style={{ width: "100%" }}>
                    <Flex gap={8} align="center" wrap>
                      <Typography.Text strong>
                        {problem.scope === "IMPORT"
                          ? "Documento"
                          : `Questão ${problem.questionOrder} (DOCX: ${problem.sourceNumber ?? "sem número"})`}
                      </Typography.Text>
                      {problem.reviewStatus && (
                        <Tag>{reviewLabels[problem.reviewStatus]}</Tag>
                      )}
                      {problem.itemId && (
                        <Button
                          size="small"
                          onClick={() => onOpenItem(problem.itemId!)}
                        >
                          Abrir questão
                        </Button>
                      )}
                    </Flex>
                    <Typography.Text>
                      {fields[problem.field || ""] || problem.field || "Geral"}:{" "}
                      {problem.message}
                    </Typography.Text>
                    {problem.suggestedFix && (
                      <Typography.Text type="secondary">
                        {problem.suggestedFix}
                      </Typography.Text>
                    )}
                  </Flex>
                </List.Item>
              )}
            />
            <Pagination
              current={page}
              pageSize={20}
              total={query.data.total}
              showSizeChanger={false}
              onChange={setPage}
              responsive
            />
          </>
        )}
      </Flex>
    </Modal>
  );
}
