"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Button,
  Card,
  Flex,
  Form,
  Progress,
  Select,
  Typography,
  Upload,
} from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/app/context/user.context";
import {
  failedImportId,
  importErrorMessage,
  loadImportRoots,
  uploadImport,
} from "./question-import.api";
import {
  DOCX_MIME,
  IMPORT_PATH,
  validateDocument,
} from "./question-import.rules";

export function ImportUpload({ retryId }: { retryId?: string }) {
  const router = useRouter();
  const { user } = useUser();
  const [file, setFile] = useState<File | null>(null);
  const [rootModuleId, setRootModuleId] = useState<string>();
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const submitting = useRef(false);
  const roots = useQuery({
    queryKey: ["question-import-roots", user?.id],
    queryFn: ({ signal }) => loadImportRoots(signal),
    enabled: !retryId && Boolean(user),
    retry: false,
  });

  useEffect(() => {
    if (!busy) return;
    const preventLeaving = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", preventLeaving);
    return () => window.removeEventListener("beforeunload", preventLeaving);
  }, [busy]);

  async function submit() {
    if (submitting.current) return;
    if (!file) {
      setError("Selecione o documento DOCX.");
      return;
    }
    const validation = validateDocument(file);
    if (validation) {
      setError(validation);
      return;
    }
    if (!retryId && !rootModuleId) {
      setError("Selecione o módulo raiz antes de importar.");
      return;
    }
    submitting.current = true;
    setBusy(true);
    setProgress(0);
    setError(undefined);
    try {
      const accepted = await uploadImport({
        file,
        rootModuleId,
        retryId,
        onProgress: setProgress,
      });
      router.push(`${IMPORT_PATH}/${accepted.id}`);
      // Keep the submit lock until navigation unmounts this form.
    } catch (cause) {
      const id = failedImportId(cause);
      if (id) {
        router.push(`${IMPORT_PATH}/${id}`);
        return;
      }
      setError(importErrorMessage(cause, true));
      submitting.current = false;
      setBusy(false);
    }
  }

  return (
    <Card title={retryId ? "Tentar novamente" : "Importar documento"}>
      <Form layout="vertical" onFinish={submit}>
        {retryId ? (
          <Typography.Paragraph>
            Selecione o documento novamente. A nova tentativa usará o mesmo
            módulo raiz e terá seu próprio acompanhamento.
          </Typography.Paragraph>
        ) : (
          <>
            <Typography.Paragraph>
              Escolha o módulo raiz e envie seu DOCX. As questões serão
              preparadas para revisão antes de serem salvas.
            </Typography.Paragraph>
            <Form.Item label="Módulo raiz" required>
              <Select
                aria-label="Módulo raiz"
                placeholder="Selecione o módulo raiz"
                showSearch
                optionFilterProp="label"
                value={rootModuleId}
                onChange={setRootModuleId}
                loading={roots.isFetching}
                disabled={busy || roots.isError}
                options={roots.data?.map((module) => ({
                  value: module.id,
                  label: module.name,
                }))}
                notFoundContent={
                  roots.isPending
                    ? "Carregando módulos…"
                    : "Nenhum módulo raiz encontrado"
                }
              />
            </Form.Item>
            {roots.isError && (
              <Alert
                style={{ marginBottom: 16 }}
                type="error"
                showIcon
                message={importErrorMessage(roots.error)}
                action={
                  <Button onClick={() => roots.refetch()}>
                    Tentar novamente
                  </Button>
                }
              />
            )}
            {roots.isSuccess && !roots.data.length && (
              <Alert
                style={{ marginBottom: 16 }}
                type="info"
                showIcon
                message="Cadastre um módulo raiz em Módulos antes de importar."
              />
            )}
          </>
        )}
        <Form.Item
          label="Documento DOCX"
          required
          extra="Até 30 MB. O arquivo precisa seguir o modelo de importação de questões."
        >
          <Upload.Dragger
            accept={`.docx,${DOCX_MIME}`}
            multiple={false}
            maxCount={1}
            disabled={busy}
            fileList={
              file ? [{ uid: "document", name: file.name, status: "done" }] : []
            }
            beforeUpload={(selected) => {
              const problem = validateDocument(selected);
              setError(problem ?? undefined);
              setFile(problem ? null : selected);
              return false;
            }}
            onRemove={() => {
              setFile(null);
              setError(undefined);
            }}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Clique ou arraste um documento para esta área
            </p>
            <p className="ant-upload-hint">Um arquivo por importação</p>
          </Upload.Dragger>
        </Form.Item>
        {file && !retryId && (
          <Typography.Paragraph type="secondary">
            Sugestão pelo nome do arquivo:{" "}
            <strong>{file.name.replace(/\.docx$/i, "")}</strong>. Confirme sua
            escolha no campo Módulo raiz; o nome do arquivo não altera a
            seleção.
          </Typography.Paragraph>
        )}
        <Flex vertical gap={16}>
          {error && (
            <Alert type="error" showIcon message={error} role="alert" />
          )}
          {busy && (
            <div role="status" aria-live="polite">
              <Progress percent={progress} status="active" />
              <Typography.Text>
                {progress < 100
                  ? "Enviando documento… Mantenha esta página aberta."
                  : "Envio concluído. Aguardando confirmação do servidor…"}
              </Typography.Text>
            </div>
          )}
          <Button
            type="primary"
            htmlType="submit"
            loading={busy}
            disabled={!file || (!retryId && (!rootModuleId || roots.isError))}
          >
            {retryId ? "Enviar nova tentativa" : "Importar questões"}
          </Button>
        </Flex>
      </Form>
    </Card>
  );
}
