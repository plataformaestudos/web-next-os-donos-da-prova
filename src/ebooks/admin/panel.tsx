"use client";

import { useState } from "react";
import { Alert, App, Button, Card, Space, Table, Tabs, Tag, Typography } from "antd";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import { Roles } from "@/util/roles";
import { FullPageLoading } from "@/ui/loading/full-page-loading";
import { adminEbookApi, ebookAdminError, removeEbookPage } from "./api";
import type { AdminEbook, AdminEbookPage } from "./types";
import { ProductEditor } from "./product-editor";
import { PageEditor } from "./page-editor";
import { EbookOrders } from "./orders";
import { formatEbookPrice } from "../format";
const adminRoles = [Roles.ADMIN];
const publicLandingBaseUrl = process.env.NODE_ENV === "production"
  ? "https://www.osdonosdaprova.com.br"
  : "http://localhost:3000";

function publicLandingUrl(path: string) {
  return new URL(path, publicLandingBaseUrl).toString();
}

export function EbookAdminPanel() {
  const { loading, allowed, user } = useAuthGuard({ requireRoles: adminRoles, redirectOnForbidden: "/home" });
  if (loading) return <FullPageLoading />;
  return allowed && user ? <PanelContent key={user.id} userId={user.id} /> : null;
}
function PanelContent({ userId }: { userId: string }) {
  return <Card><Typography.Title level={2}>Ebooks</Typography.Title><Typography.Paragraph>Gerencie produtos, PDFs privados, páginas de venda e pedidos.</Typography.Paragraph><Tabs destroyInactiveTabPane items={[
    { key: "products", label: "Produtos e PDFs", children: <Products userId={userId} /> },
    { key: "pages", label: "Páginas de venda", children: <Pages userId={userId} /> },
    { key: "orders", label: "Pedidos", children: <EbookOrders userId={userId} /> },
  ]} /></Card>;
}
function Products({ userId }: { userId: string }) {
  const [page, setPage] = useState(1);
  const [editor, setEditor] = useState<{ ebook: AdminEbook | null } | null>(null);
  const products = useQuery({ queryKey: ["ebook-admin", userId, "products", page], queryFn: () => adminEbookApi.ebooks(page) });
  return <Space direction="vertical" style={{ width: "100%" }}>
    <Space wrap><Button type="primary" onClick={() => setEditor({ ebook: null })}>Novo ebook</Button><Button loading={products.isFetching} onClick={() => products.refetch()}>Atualizar</Button></Space>
    {products.error && <Alert type="error" message={ebookAdminError(products.error)} />}
    <Table<AdminEbook> rowKey="id" loading={products.isFetching} dataSource={products.data?.data} scroll={{ x: 600 }} pagination={{ current: page, pageSize: 20, total: products.data?.total, showSizeChanger: false, onChange: setPage }} columns={[
      { title: "Título", dataIndex: "title" }, { title: "Preço", dataIndex: "priceCents", render: (value: number) => formatEbookPrice(value) },
      { title: "Estado", dataIndex: "status", render: (value: string) => <Tag>{value}</Tag> },
      { title: "PDF", render: (_, item) => item.currentFileId ? "Enviado" : "Pendente" },
      { title: "Ações", render: (_, item) => <Button onClick={() => setEditor({ ebook: item })}>Editar e gerenciar PDF</Button> },
    ]} />
    {editor && <ProductEditor ebook={editor.ebook} userId={userId} onClose={() => setEditor(null)} />}
  </Space>;
}
function Pages({ userId }: { userId: string }) {
  const { modal, message } = App.useApp();
  const cache = useQueryClient();
  const [page, setPage] = useState(1);
  const [editor, setEditor] = useState<{ page: AdminEbookPage | null } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pages = useQuery({ queryKey: ["ebook-admin", userId, "pages", page], queryFn: () => adminEbookApi.pages(page) });
  const remove = (item: AdminEbookPage) => modal.confirm({ title: "Excluir página de venda?", content: `A página ${item.path} será removida. Páginas com pedidos são preservadas pelo servidor.`, okText: "Excluir", okButtonProps: { danger: true }, cancelText: "Cancelar", onOk: async () => {
    try { await removeEbookPage(item.id); await cache.invalidateQueries({ queryKey: ["ebook-admin", userId] }); message.success("Página excluída."); }
    catch (cause) { setError(ebookAdminError(cause)); throw cause; }
  } });
  return <Space direction="vertical" style={{ width: "100%" }}>
    <Space wrap><Button type="primary" onClick={() => setEditor({ page: null })}>Nova página</Button><Button loading={pages.isFetching} onClick={() => pages.refetch()}>Atualizar</Button></Space>
    {(error || pages.error) && <Alert type="error" message={error || ebookAdminError(pages.error)} />}
    <Table<AdminEbookPage> rowKey="id" loading={pages.isFetching} dataSource={pages.data?.data} scroll={{ x: 650 }} pagination={{ current: page, pageSize: 20, total: pages.data?.total, showSizeChanger: false, onChange: setPage }} columns={[
      { title: "Caminho do rascunho", dataIndex: "path" }, { title: "Publicação", render: (_, item) => item.published ? <Tag color="green">Publicada: {item.published.path}</Tag> : <Tag>Rascunho</Tag> },
      { title: "Ações", render: (_, item) => <Space wrap>{item.published && <Button href={publicLandingUrl(item.published.path)} target="_blank" rel="noopener noreferrer">Abrir landing</Button>}<Button onClick={() => setEditor({ page: item })}>Editar e visualizar</Button><Button danger disabled={Boolean(item.published)} onClick={() => remove(item)}>Excluir</Button></Space> },
    ]} />
    {editor && <PageEditor page={editor.page} userId={userId} onClose={() => setEditor(null)} />}
  </Space>;
}
