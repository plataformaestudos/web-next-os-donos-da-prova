"use client";

import { useState } from "react";
import { Alert, App, Button, Descriptions, Modal, Space, Table, Tag, Typography } from "antd";
import { useQuery } from "@tanstack/react-query";
import { adminEbookApi, ebookAdminError } from "./api";
import type { AdminOrder } from "./types";
import { formatEbookPrice } from "../format";

export function EbookOrders({ userId }: { userId: string }) {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);
  const orders = useQuery({ queryKey: ["ebook-admin", userId, "orders", page], queryFn: () => adminEbookApi.orders(page) });
  return <Space direction="vertical" style={{ width: "100%" }}>
    <Button onClick={() => orders.refetch()} loading={orders.isFetching}>Atualizar pedidos</Button>
    {orders.error && <Alert type="error" message={ebookAdminError(orders.error)} />}
    <Table<AdminOrder> rowKey="id" loading={orders.isFetching} dataSource={orders.data?.data} scroll={{ x: 900 }} pagination={{ current: page, pageSize: 20, total: orders.data?.total, showSizeChanger: false, onChange: setPage }} columns={[
      { title: "Ebook", dataIndex: "title" }, { title: "Comprador", dataIndex: "buyerName" }, { title: "Email", dataIndex: "buyerEmail" },
      { title: "Pagamento", dataIndex: "method", render: (value: AdminOrder["method"]) => value === "PIX" ? "Pix" : "Cartão à vista" },
      { title: "Valor", dataIndex: "priceCents", render: (value: number) => formatEbookPrice(value) },
      { title: "Estado", dataIndex: "status", render: (value: string) => <Tag>{value}</Tag> },
      { title: "Detalhes", render: (_, order) => <Button onClick={() => setSelected(order.id)}>Consultar pedido</Button> },
    ]} />
    {selected && <OrderDetail key={selected} id={selected} userId={userId} onClose={() => setSelected(null)} />}
  </Space>;
}
function OrderDetail({ id, userId, onClose }: { id: string; userId: string; onClose: () => void }) {
  const { message } = App.useApp();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const order = useQuery({ queryKey: ["ebook-admin", userId, "order", id], queryFn: () => adminEbookApi.order(id) });
  const email = useQuery({ queryKey: ["ebook-admin", userId, "email", id], queryFn: () => adminEbookApi.email(id) });
  const resend = async () => {
    setSending(true); setError(null);
    try { await adminEbookApi.resend(id); await email.refetch(); message.success("Reenvio solicitado. A entrega será processada."); }
    catch (cause) { setError(ebookAdminError(cause)); } finally { setSending(false); }
  };
  const data = order.data;
  return <Modal open title="Detalhes do pedido" onCancel={onClose} footer={<Button onClick={onClose}>Fechar</Button>} width={760}>
    <Space direction="vertical" style={{ width: "100%" }}>
      {(error || order.error || email.error) && <Alert type="error" message={error || ebookAdminError(order.error || email.error)} />}
      <Button loading={order.isFetching || email.isFetching} onClick={() => { void order.refetch(); void email.refetch(); }}>Atualizar estado</Button>
      {data && <Descriptions column={1} bordered items={[
        { key: "id", label: "Pedido", children: data.id }, { key: "title", label: "Ebook", children: data.title },
        { key: "buyer", label: "Comprador", children: data.buyerName }, { key: "email", label: "Email", children: data.buyerEmail },
        { key: "price", label: "Valor", children: formatEbookPrice(data.priceCents) }, { key: "method", label: "Pagamento", children: data.method === "PIX" ? "Pix" : "Cartão à vista" },
        { key: "status", label: "Estado", children: data.status }, { key: "attempt", label: "Tentativa de cobrança", children: data.attempt?.stage || "Sem tentativa" },
        { key: "paid", label: "Confirmação", children: data.paidAt ? new Date(data.paidAt).toLocaleString("pt-BR") : "Aguardando confirmação" },
      ]} />}
      <Typography.Title level={5}>Entrega por email</Typography.Title>
      {email.data && <>
        <Alert type={email.data.configured ? "info" : "warning"} message={email.data.configured ? "Serviço de email configurado." : "Serviço de email ainda não configurado."} />
        <Table rowKey={(job, index) => `${job.created_at}-${index}`} pagination={false} dataSource={email.data.jobs} columns={[{ title: "Estado", dataIndex: "status" }, { title: "Tentativas", dataIndex: "attempts" }, { title: "Enviado em", dataIndex: "sent_at", render: (value: string | null) => value ? new Date(value).toLocaleString("pt-BR") : "—" }]} />
      </>}
      <Button loading={sending} disabled={!data || data.status !== "PAID" || Boolean(data.revokedAt) || !email.data?.configured} onClick={() => void resend()}>Reenviar email de acesso</Button>
      <Typography.Text type="secondary">O reenvio exige pagamento confirmado e acesso vigente.</Typography.Text>
    </Space>
  </Modal>;
}
