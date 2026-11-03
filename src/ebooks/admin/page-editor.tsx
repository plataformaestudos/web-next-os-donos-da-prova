"use client";

import { useEffect, useRef, useState } from "react";
import { Alert, App, Button, Card, Collapse, Form, Input, Modal, Select, Space, Switch, Typography, Upload } from "antd";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { EbookPageContent, EbookProduct } from "../types";
import { adminEbookApi, ebookAdminError, equalPageDrafts } from "./api";
import { emptyContent, type AdminEbookPage, type PageDraft } from "./types";
import { LandingPreview } from "./preview";
import { pageImagePath, withPageImages, withoutSampleImage } from "../page-content";

type ImageField = string;
type CustomSection = "benefits" | "contents" | "highlights" | "strategy" | "samples" | "audience";
const imageLabels: Record<string, string> = { bannerDesktopUrl: "Apresentação para computador", bannerMobileUrl: "Apresentação para celular", coverUrl: "Capa do ebook", socialImageUrl: "Imagem de prévia ao compartilhar o link" };
const sectionConfig = {
  benefits: { label: "Diferenciais", title: "benefitsTitle", description: "benefitsDescription", max: 30 },
  contents: { label: "Conteúdo do ebook", title: "contentsTitle", description: "contentsDescription", max: 60 },
  highlights: { label: "Faixa de destaques", title: undefined, description: undefined, max: 8 },
  strategy: { label: "Estratégia de estudo", title: "strategyTitle", description: "strategyDescription", max: 12 },
  samples: { label: "Amostras do material", title: "samplesTitle", description: "samplesDescription", max: 6 },
  audience: { label: "Público-alvo", title: "audienceTitle", description: "audienceDescription", max: 12 },
} as const;
const extraVisibility = { highlights: "showHighlights", strategy: "showStrategy", samples: "showSamples", audience: "showAudience" } as const;
const initialProduct: EbookProduct = { id: "", title: "Título do ebook", description: "", priceCents: 0 };

export function PageEditor({ page, userId, onClose }: { page: AdminEbookPage | null; userId: string; onClose: () => void }) {
  const { message, modal } = App.useApp();
  const cache = useQueryClient();
  const [current, setCurrent] = useState(page);
  const [previewExpanded, setPreviewExpanded] = useState(false);
  const previewArea = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localFiles, setLocalFiles] = useState<Partial<Record<ImageField, File>>>({});
  const [localUrls, setLocalUrls] = useState<Partial<Record<ImageField, string>>>({});
  const [form] = Form.useForm<PageDraft>();
  const initial: PageDraft = page ? { ebookId: page.ebookId, path: page.path, content: { ...emptyContent(), ...page.content }, sections: { ...page.sections } } : { ebookId: "", path: "/meu-ebook", content: emptyContent(), sections: { benefits: true, contents: true, faq: true } };
  const watched = Form.useWatch([], { form, preserve: true });
  const values: PageDraft = watched || initial;
  const ebookQuery = useQuery({ queryKey: ["ebook-admin", userId, "product", values.ebookId], enabled: Boolean(values.ebookId), queryFn: () => adminEbookApi.ebook(values.ebookId) });
  const [productSearchPage, setProductSearchPage] = useState(1);
  const products = useQuery({ queryKey: ["ebook-admin", userId, "product-options", productSearchPage], queryFn: () => adminEbookApi.ebooks(productSearchPage, 100) });
  const preview = useQuery({ queryKey: ["ebook-admin", userId, "preview", current?.id], enabled: Boolean(current), queryFn: () => current ? adminEbookApi.preview(current.id) : Promise.reject(new Error("Salve a página primeiro.")) });
  useEffect(() => {
    const urls: Partial<Record<ImageField, string>> = {};
    for (const field of Object.keys(localFiles) as ImageField[]) {
      const file = localFiles[field]; if (file) urls[field] = URL.createObjectURL(file);
    }
    setLocalUrls(urls);
    return () => { Object.values(urls).forEach((url) => { if (url) URL.revokeObjectURL(url); }); };
  }, [localFiles]);
  const refresh = () => cache.invalidateQueries({ queryKey: ["ebook-admin", userId] });
  const save = async () => {
    setBusy(true); setError(null);
    try {
      const values = await form.validateFields();
      const draft: PageDraft = {
        ...values,
        content: { ...values.content },
        sections: { ...values.sections },
      };
      // Create a draft first to obtain the page-scoped image upload endpoint.
      let saved = await adminEbookApi.savePage(current?.id, draft);
      setCurrent(saved);
      let content: EbookPageContent = { ...draft.content };
      const remaining = { ...localFiles };
      for (const field of Object.keys(localFiles) as ImageField[]) {
        const file = localFiles[field];
        if (!file) continue;
        const result = await adminEbookApi.uploadImage(saved.id, file);
        content = withPageImages(content, { [field]: result.url });
        form.setFieldValue(pageImagePath(field), result.url);
        delete remaining[field];
        setLocalFiles({ ...remaining });
      }
      saved = await adminEbookApi.savePage(saved.id, { ...draft, content });
      setCurrent(saved); form.setFieldsValue({ ebookId: saved.ebookId, path: saved.path, content: saved.content, sections: saved.sections }); await refresh(); message.success("Rascunho salvo. A publicação é uma ação separada.");
    } catch (cause) { setError(cause instanceof Error ? ebookAdminError(cause) : "Revise os campos do formulário."); } finally { setBusy(false); }
  };
  const hasUnsavedChanges = !current || !equalPageDrafts(values, { ebookId: current.ebookId, path: current.path, content: { ...emptyContent(), ...current.content }, sections: current.sections }) || Object.keys(localFiles).length > 0;
  const publish = () => {
    if (!current) return;
    modal.confirm({ title: "Publicar o rascunho salvo?", content: "As alterações não salvas e imagens locais não serão publicadas. Salve o rascunho antes de continuar.", okText: "Publicar rascunho salvo", cancelText: "Cancelar", onOk: async () => {
      setBusy(true); setError(null);
      try { setCurrent(await adminEbookApi.publish(current.id)); await refresh(); message.success("Página publicada."); }
      catch (cause) { setError(ebookAdminError(cause)); throw cause; } finally { setBusy(false); }
    } });
  };
  const unpublish = async () => {
    if (!current) return;
    setBusy(true); setError(null);
    try { setCurrent(await adminEbookApi.unpublish(current.id)); await refresh(); message.success("Página despublicada."); }
    catch (cause) { setError(ebookAdminError(cause)); } finally { setBusy(false); }
  };
  const selectImage = (field: ImageField, file: File) => {
    if (file.size > 8 * 1024 * 1024 || !["image/png", "image/jpeg", "image/webp"].includes(file.type)) { setError("Use uma imagem PNG, JPEG ou WebP de até 8 MiB."); return; }
    setError(null); setLocalFiles((previous) => ({ ...previous, [field]: file }));
  };
  const close = () => {
    if (busy) return;
    if (hasUnsavedChanges) modal.confirm({ title: "Fechar o editor?", content: "As alterações não salvas serão descartadas.", okText: "Descartar e fechar", cancelText: "Continuar editando", onOk: onClose });
    else onClose();
  };
  const options = [...(products.data?.data || []), ...(ebookQuery.data && !products.data?.data.some((item) => item.id === ebookQuery.data.id) ? [ebookQuery.data] : [])];
  const renderImageField = (field: ImageField, help?: string, relativeName?: (string | number)[]) => (
    <Card key={field} size="small" title={imageLabels[field] || "Imagem da amostra"} style={{ marginBottom: 12 }}>
      {help && <Typography.Paragraph type="secondary">{help}</Typography.Paragraph>}
      <Form.Item name={relativeName || pageImagePath(field)} label="URL pública HTTPS">
        <Input maxLength={2048} onChange={() => setLocalFiles((previous) => { const next = { ...previous }; delete next[field]; return next; })} />
      </Form.Item>
      <Upload accept="image/png,image/jpeg,image/webp" showUploadList={false} disabled={busy} beforeUpload={(file) => { selectImage(field, file); return false; }}>
        <Button disabled={busy}>Escolher imagem local</Button>
      </Upload>
      {localFiles[field] && <Space wrap><Typography.Text>{localFiles[field]?.name} (ainda não salva)</Typography.Text><Button onClick={() => setLocalFiles((previous) => { const next = { ...previous }; delete next[field]; return next; })}>Descartar imagem local</Button></Space>}
    </Card>
  );
  const renderOptionalSection = (section: CustomSection) => {
    const config = sectionConfig[section];
    const visibilityPath = section === "benefits" || section === "contents" ? ["sections", section] : ["content", extraVisibility[section]];
    return <Card size="small">
      <Form.Item name={visibilityPath} label={`Mostrar ${config.label.toLowerCase()}`} valuePropName="checked"><Switch aria-label={`Mostrar ${config.label.toLowerCase()}`} /></Form.Item>
      <Typography.Paragraph type="secondary">Ocultar preserva os textos e as imagens. Blocos novos aparecem quando têm itens preenchidos.</Typography.Paragraph>
      {section === "highlights" && <Typography.Paragraph type="secondary">Use informações reais, como quantidade de questões, páginas ou temas. Os três primeiros destaques também aparecem na abertura.</Typography.Paragraph>}
      {config.title && <Form.Item name={["content", config.title]} label="Título da seção"><Input maxLength={200} /></Form.Item>}
      {config.description && <Form.Item name={["content", config.description]} label="Introdução da seção"><Input.TextArea rows={2} maxLength={3000} /></Form.Item>}
      <Form.List name={["content", section]}>{(fields, { add, remove }) => <>
        {fields.map((field, index) => <Card key={field.key} size="small" title={`Item ${index + 1}`} style={{ marginBottom: 8 }} extra={<Button type="text" danger aria-label={`Remover item ${index + 1} de ${config.label}`} onClick={() => {
          if (section === "samples") setLocalFiles((previous) => withoutSampleImage(previous, field.name));
          remove(field.name);
        }}>Remover</Button>}>
          <Form.Item name={[field.name, "title"]} label={section === "highlights" ? "Destaque (ex.: 200 questões)" : "Título"}><Input maxLength={200} /></Form.Item>
          <Form.Item name={[field.name, "description"]} label={section === "highlights" ? "Complemento (ex.: inéditas e comentadas)" : "Descrição"}><Input.TextArea rows={2} maxLength={3000} /></Form.Item>
          {section === "samples" && renderImageField(`samples.${field.name}.imageUrl`, "Envie uma imagem de uma página real do material. A amostra é pública; o PDF completo permanece privado.", [field.name, "imageUrl"])}
        </Card>)}
        <Button disabled={fields.length >= config.max} onClick={() => add({ title: "", description: "", ...(section === "samples" ? { imageUrl: "" } : {}) })}>Adicionar item</Button>
      </>}</Form.List>
    </Card>;
  };
  const renderFaq = () => <Card size="small">
    <Form.Item name={["sections", "faq"]} label="Mostrar dúvidas frequentes" valuePropName="checked"><Switch aria-label="Mostrar dúvidas frequentes" /></Form.Item>
    <Typography.Paragraph type="secondary">Personalize as respostas com as condições reais deste ebook. Ocultar a seção preserva as perguntas.</Typography.Paragraph>
    <Form.Item name={["content", "faqTitle"]} label="Título da seção"><Input maxLength={200} /></Form.Item>
    <Form.List name={["content", "faq"]}>{(fields, { add, remove }) => <>
      {fields.map((field, index) => <Card key={field.key} size="small" title={`Pergunta ${index + 1}`} style={{ marginBottom: 8 }} extra={<Button type="text" danger aria-label={`Remover pergunta ${index + 1}`} onClick={() => remove(field.name)}>Remover</Button>}>
        <Form.Item name={[field.name, "question"]} label="Pergunta"><Input maxLength={300} /></Form.Item>
        <Form.Item name={[field.name, "answer"]} label="Resposta"><Input.TextArea rows={3} maxLength={3000} /></Form.Item>
      </Card>)}
      <Button disabled={fields.length >= 40} onClick={() => add({ question: "", answer: "" })}>Adicionar pergunta</Button>
    </>}</Form.List>
  </Card>;
  return <Modal open title="Página de venda do ebook" width="96vw" style={{ top: 20 }} footer={null} onCancel={close} maskClosable={false} closable={!busy}>
    <Space direction="vertical" style={{ width: "100%" }}>
      {error && <Alert type="error" showIcon message={error} />}
      <Alert type={current?.published ? "success" : "info"} message={current?.published ? `Publicada em ${current.published.path}. O rascunho pode conter alterações posteriores.` : "Rascunho: esta página ainda não está publicada."} />
      <Typography.Text type="secondary">{hasUnsavedChanges ? "Há alterações não salvas. Salve o rascunho para habilitar a publicação." : "Todas as alterações estão salvas."}</Typography.Text>
      <Space wrap><Button onClick={() => { previewArea.current?.scrollIntoView({ behavior: "smooth", block: "start" }); previewArea.current?.focus({ preventScroll: true }); }}>Visualizar landing</Button><Button type="primary" loading={busy} onClick={() => void save()}>Salvar rascunho</Button><Button disabled={busy || !current || hasUnsavedChanges || Boolean(preview.data?.issues.length)} onClick={publish}>Publicar rascunho salvo</Button>{current?.published && <Button danger disabled={busy} onClick={() => void unpublish()}>Despublicar</Button>}</Space>
      {preview.error && <Alert type="error" message={ebookAdminError(preview.error)} action={<Button onClick={() => preview.refetch()}>Atualizar validação</Button>} />}
      {preview.data && <Alert type={preview.data.issues.length ? "warning" : "success"} message="Validação do rascunho salvo no servidor" description={preview.data.issues.length ? <ul>{preview.data.issues.map((issue) => <li key={issue}>{issue}</li>)}</ul> : "Rascunho pronto para publicar."} />}
      <div style={{ display: "grid", gridTemplateColumns: previewExpanded ? "1fr" : "repeat(auto-fit, minmax(min(100%, 420px), 1fr))", gap: 20, alignItems: "start" }}>
        <Form form={form} layout="vertical" initialValues={initial} disabled={busy} style={{ display: previewExpanded ? "none" : undefined }}>
          {products.error && <Alert type="error" message={ebookAdminError(products.error)} />}
          <Collapse
            ghost
            items={[
              {
                key: "main",
                label: "Identificação e abertura",
                forceRender: true,
                children: <>
                  <Form.Item name="ebookId" label="Ebook" rules={[{ required: true }]}><Select showSearch optionFilterProp="label" loading={products.isFetching} options={options.map((item) => ({ value: item.id, label: item.title }))} /></Form.Item>
                  {(products.data?.total || 0) > 100 && <Space><Button disabled={productSearchPage === 1} onClick={() => setProductSearchPage((value) => value - 1)}>Ebooks anteriores</Button><Typography.Text>Página {productSearchPage}</Typography.Text><Button disabled={productSearchPage * 100 >= (products.data?.total || 0)} onClick={() => setProductSearchPage((value) => value + 1)}>Próximos ebooks</Button></Space>}
                  <Form.Item name="path" label="Caminho público da página" rules={[{ required: true, whitespace: true }]} extra="Exemplos: /portugues ou /concurso1/ebook. Evite prefixos reservados, como /ebooks, /admin e /api."><Input maxLength={202} /></Form.Item>
                  <Form.Item name={["content", "heroLabel"]} label="Etiqueta acima da chamada" extra="Se ficar vazia, será usado o título do ebook."><Input maxLength={200} /></Form.Item>
                  <Form.Item name={["content", "headline"]} label="Chamada principal"><Input maxLength={300} /></Form.Item>
                  <Form.Item name={["content", "headlineHighlight"]} label="Complemento da chamada em vermelho" extra="Opcional. Aparece depois da chamada principal."><Input maxLength={200} /></Form.Item>
                  <Form.Item name={["content", "description"]} label="Descrição da página"><Input.TextArea rows={3} maxLength={10000} /></Form.Item>
                  <Form.Item name={["content", "ctaText"]} label="Texto do botão de compra"><Input maxLength={80} /></Form.Item>
                </>,
              },
              {
                key: "banners",
                label: "Imagens e capa",
                forceRender: true,
                children: <>{renderImageField("bannerDesktopUrl", "Imagem ou mockup ao lado da chamada. Prefira um fundo transparente ou claro, sem texto de preço.")}{renderImageField("bannerMobileUrl", "Versão exibida no celular. Use uma imagem vertical legível em telas pequenas.")}{renderImageField("coverUrl", "Opcional. Capa exibida junto ao conteúdo e na oferta final; não substitui as imagens da abertura.")}</>,
              },
              { key: "highlights", label: "Faixa de destaques", forceRender: true, children: renderOptionalSection("highlights") },
              { key: "benefits", label: "Diferenciais", forceRender: true, children: renderOptionalSection("benefits") },
              { key: "contents", label: "Conteúdo do ebook", forceRender: true, children: renderOptionalSection("contents") },
              { key: "strategy", label: "Estratégia de estudo", forceRender: true, children: renderOptionalSection("strategy") },
              { key: "samples", label: "Amostras do material", forceRender: true, children: renderOptionalSection("samples") },
              { key: "audience", label: "Público-alvo", forceRender: true, children: renderOptionalSection("audience") },
              { key: "offer", label: "Oferta final", forceRender: true, children: <>
                <Typography.Paragraph type="secondary">O preço vem do produto selecionado. A compra usa o checkout existente, com Pix ou cartão à vista.</Typography.Paragraph>
                <Form.Item name={["content", "finalTitle"]} label="Chamada da oferta"><Input maxLength={200} /></Form.Item>
                <Form.Item name={["content", "finalDescription"]} label="Descrição da oferta"><Input.TextArea rows={2} maxLength={3000} /></Form.Item>
              </> },
              { key: "faq", label: "Dúvidas frequentes", forceRender: true, children: renderFaq() },
              {
                key: "sharing",
                label: "Compartilhamento e buscadores",
                forceRender: true,
                children: <>
                  {renderImageField("socialImageUrl", "Imagem usada no cartão de prévia quando alguém compartilha o link em apps que exibem esse recurso. Ela não altera o banner da landing.")}
                  <Form.Item name={["content", "seoTitle"]} label="Título para buscadores"><Input maxLength={200} /></Form.Item>
                  <Form.Item name={["content", "seoDescription"]} label="Descrição para buscadores"><Input.TextArea maxLength={500} /></Form.Item>
                </>,
              },
            ]}
          />
        </Form>
        <div ref={previewArea} tabIndex={-1} aria-label="Prévia da landing" style={{ minWidth: 0 }}>
          {ebookQuery.error && <Alert type="error" message={ebookAdminError(ebookQuery.error)} />}
          <LandingPreview expanded={previewExpanded} onExpand={() => setPreviewExpanded((value) => !value)} ebook={ebookQuery.data || initialProduct} content={withPageImages(values.content, localUrls)} sections={values.sections} path={values.path} />
        </div>
      </div>
    </Space>
  </Modal>;
}
