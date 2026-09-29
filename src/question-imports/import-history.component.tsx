"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Alert, Button, Empty, Flex, Table, Tabs, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useUser } from "@/app/context/user.context";
import { importErrorMessage, loadRecentImports } from "./question-import.api";
import type { RecentQuestionImport } from "./question-import.model";
import {
  IMPORT_PATH,
  isProcessing,
  statusLabels,
} from "./question-import.rules";
import { ImportUpload } from "./import-upload.component";

const columns: ColumnsType<RecentQuestionImport> = [
  {
    title: "Arquivo",
    dataIndex: "sourceFileName",
    render: (name: string, item) => (
      <Link href={`${IMPORT_PATH}/${item.id}`}>{name}</Link>
    ),
  },
  { title: "Módulo raiz", render: (_, item) => item.rootModule?.name ?? "—" },
  {
    title: "Enviada em",
    dataIndex: "createdAt",
    render: (value: string) => new Date(value).toLocaleString("pt-BR"),
  },
  {
    title: "Situação",
    render: (_, item) => (
      <Tag
        color={
          item.status === "FAILED"
            ? "error"
            : isProcessing(item.status)
              ? "processing"
              : item.status === "COMPLETED"
                ? "success"
                : "default"
        }
      >
        {statusLabels[item.status]}
        {isProcessing(item.status) ? ` (${item.progress}%)` : ""}
      </Tag>
    ),
  },
  {
    title: "Questões",
    render: (_, item) => (
      <Flex vertical>
        <span>{item.totalItems} identificadas</span>
        <span>{item.savedItems} salvas</span>
        {item.invalidItems > 0 && (
          <Typography.Text type="danger">
            {item.invalidItems} com erros de validação
          </Typography.Text>
        )}
      </Flex>
    ),
  },
  {
    title: "Ação",
    key: "action",
    render: (_, item) => (
      <Link
        href={`${IMPORT_PATH}/${item.id}`}
        aria-label={`Abrir importação ${item.sourceFileName}`}
      >
        Abrir
      </Link>
    ),
  },
];

function ImportHistory({ active }: { active: boolean }) {
  const { user } = useUser();
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: [
      "question-import-history",
      user?.id,
      user?.profile?.role_id,
      page,
    ],
    queryFn: ({ signal }) => loadRecentImports(page, signal),
    enabled: active && Boolean(user),
    retry: false,
    refetchOnMount: "always",
    refetchInterval: (current) =>
      active &&
      !current.state.error &&
      current.state.data?.items.some((item) => isProcessing(item.status))
        ? 5000
        : false,
  });

  return (
    <Flex vertical gap={16}>
      <Flex justify="space-between" align="center" gap={16} wrap>
        <Typography.Paragraph style={{ margin: 0 }}>
          Abra uma importação para acompanhar o processamento ou continuar a
          revisão das questões.
        </Typography.Paragraph>
        <Button onClick={() => query.refetch()} loading={query.isFetching}>
          Atualizar
        </Button>
      </Flex>
      {query.isError && (
        <Alert
          type="error"
          showIcon
          message={importErrorMessage(query.error)}
          description="Não foi possível atualizar a lista de importações. Tente novamente."
        />
      )}
      {!query.isError && (
        <Table<RecentQuestionImport>
          rowKey="id"
          columns={columns}
          dataSource={query.data?.items ?? []}
          loading={query.isFetching}
          scroll={{ x: 950 }}
          locale={{
            emptyText: (
              <Empty description="Nenhuma importação encontrada. Use Nova importação para enviar seu primeiro documento." />
            ),
          }}
          pagination={{
            current: page,
            pageSize: 10,
            total: query.data?.total ?? 0,
            showSizeChanger: false,
            onChange: setPage,
            showTotal: (total) => `${total} importações`,
          }}
        />
      )}
    </Flex>
  );
}

export function ImportHome({
  initialTab = "history",
}: {
  initialTab?: string;
}) {
  const [tab, setTab] = useState(initialTab);
  return (
    <Tabs
      activeKey={tab}
      onChange={setTab}
      items={[
        {
          key: "history",
          label: "Importações recentes",
          children: <ImportHistory active={tab === "history"} />,
        },
        { key: "new", label: "Nova importação", children: <ImportUpload /> },
      ]}
    />
  );
}
