"use client";

import { useState } from "react";
import { Alert, App, Button, Form, Input, Modal, Select, Space, Table, Tag, Upload } from "antd";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminEbookApi, downloadAdminPdf, ebookAdminError, reaisToCents } from "./api";
import type { AdminEbook, EbookFile } from "./types";

interface ProductValues { title: string; description: string; priceReais: string; status: AdminEbook["status"] }
export function ProductEditor({ ebook, onClose, userId }: { ebook: AdminEbook | null; onClose: () => void; userId: string }) {
  const { message } = App.useApp();
  const cache = useQueryClient();
  const [current, setCurrent] = useState(ebook);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm<ProductValues>();
  const files = useQuery({ queryKey: ["ebook-admin", userId, "files", current?.id], enabled: Boolean(current), queryFn: () => current ? adminEbookApi.files(current.id) : Promise.resolve([]) });
  const refresh = () => cache.invalidateQueries({ queryKey: ["ebook-admin", userId] });
  const save = async (values: ProductValues) => {
    setBusy(true); setError(null);
    try {
      const product = await adminEbookApi.saveEbook(current?.id, { title: values.title, description: values.description, priceCents: reaisToCents(values.priceReais), ...(current ? { status: values.status } : {}) });
      setCurrent(product); form.setFieldValue("status", product.status); await refresh(); message.success("Ebook salvo.");
    } catch (cause) { setError(ebookAdminError(cause)); } finally { setBusy(false); }
  };
  const upload = async (file: File) => {
    if (!current) return;
    if (file.size > 30 * 1024 * 1024 || !file.name.toLowerCase().endsWith(".pdf")) { setError("Selecione um PDF de até 30 MiB."); return; }
    setBusy(true); setError(null);
    try { await adminEbookApi.uploadPdf(current.id, file); await refresh(); setCurrent(await adminEbookApi.ebook(current.id)); message.success("Nova versão do PDF enviada."); }
    catch (cause) { setError(ebookAdminError(cause)); } finally { setBusy(false); }
  };
  const download = async (file: EbookFile) => { setBusy(true); setError(null); try { if (current) await downloadAdminPdf(current.id, file); } catch (cause) { setError(ebookAdminError(cause)); } finally { setBusy(false); } };
  return <Modal open title={current ? "Editar ebook" : "Novo ebook"} onCancel={() => !busy && onClose()} footer={null} width={760} maskClosable={false} closable={!busy}>
    <Space direction="vertical" style={{ width: "100%" }}>
      {error && <Alert type="error" showIcon message={error} />}
      <Form form={form} layout="vertical" initialValues={{ title: ebook?.title || "", description: ebook?.description || "", priceReais: ebook ? (ebook.priceCents / 100).toFixed(2).replace(".", ",") : "", status: ebook?.status || "DRAFT" }} onFinish={save} disabled={busy}>
        <Form.Item name="title" label="Título" rules={[{ required: true, whitespace: true }]}><Input maxLength={200} /></Form.Item>
        <Form.Item name="description" label="Descrição do produto" rules={[{ required: true, whitespace: true }]}><Input.TextArea rows={3} maxLength={10000} /></Form.Item>
        <Form.Item name="priceReais" label="Preço em reais (R$)" rules={[{ required: true }, { validator: async (_, value: string) => { reaisToCents(value || ""); } }]}><Input inputMode="decimal" placeholder="19,90" /></Form.Item>
        {current && <Form.Item name="status" label="Estado do produto"><Select options={[{ value: "DRAFT", label: "Rascunho" }, { value: "ACTIVE", label: "Ativo", disabled: !current.currentFileId }, { value: "INACTIVE", label: "Inativo" }]} /></Form.Item>}
        <Button htmlType="submit" type="primary" loading={busy}>Salvar ebook</Button>
      </Form>
      {current ? <>
        <Alert type="info" message="Cada envio cria uma versão privada. O PDF é obrigatório para ativar o produto." />
        <Upload accept="application/pdf,.pdf" showUploadList={false} beforeUpload={(file) => { void upload(file); return false; }} disabled={busy}><Button disabled={busy}>Enviar nova versão do PDF</Button></Upload>
        {files.error && <Alert type="error" message={ebookAdminError(files.error)} action={<Button onClick={() => files.refetch()}>Tentar novamente</Button>} />}
        <Table<EbookFile> rowKey="id" dataSource={files.data} loading={files.isFetching} pagination={false} columns={[{ title: "Versão", dataIndex: "version" }, { title: "Arquivo", dataIndex: "originalName" }, { title: "Atual", render: (_, file) => file.id === current.currentFileId ? <Tag color="green">Atual</Tag> : null }, { title: "Download", render: (_, file) => <Button disabled={busy} onClick={() => void download(file)}>Baixar PDF</Button> }]} />
      </> : <Alert type="info" message="Salve o ebook para enviar o PDF. Novos produtos começam como rascunho." />}
    </Space>
  </Modal>;
}
