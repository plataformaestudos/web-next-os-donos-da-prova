"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Button,
  Card,
  Flex,
  Form,
  InputNumber,
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
  MAX_QUESTION_NUMBER,
  validateDocument,
  validateQuestionRange,
} from "./question-import.rules";

export function ImportUpload({ retryId }: { retryId?: string }) {
  const router = useRouter();
  const { user } = useUser();
  const [file, setFile] = useState<File | null>(null);
  const [rootModuleId, setRootModuleId] = useState<string>();
  const [startQuestionNumber, setStartQuestionNumber] = useState<number | null>(
    null,
  );
  const [endQuestionNumber, setEndQuestionNumber] = useState<number | null>(
    null,
  );
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
    const rangeError =
      !retryId && validateQuestionRange(startQuestionNumber, endQuestionNumber);
    if (rangeError) {
      setError(rangeError);
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
        startQuestionNumber: startQuestionNumber ?? undefined,
        endQuestionNumber: endQuestionNumber ?? undefined,
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
            módulo raiz e o mesmo intervalo de questões da importação anterior,
            e terá seu próprio acompanhamento.
          </Typography.Paragraph>
        ) : (
          <>
            <Typography.Paragraph>
              Envie seu DOCX e, se desejar, escolha um módulo raiz existente.
              Sem seleção, o nome do arquivo será usado para reaproveitar ou
              criar a raiz. As questões serão preparadas para revisão antes de
              serem salvas.
            </Typography.Paragraph>
            <Form.Item
              label="Módulo raiz (opcional)"
              extra="Sem seleção, usa o nome do arquivo, sem .docx. Se já existir uma raiz com esse nome, ela será reaproveitada."
            >
              <Select
                aria-label="Módulo raiz"
                placeholder="Usar o nome do arquivo"
                allowClear
                showSearch
                optionFilterProp="label"
                value={rootModuleId}
                onChange={setRootModuleId}
                loading={roots.isFetching}
                disabled={busy}
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
                type="warning"
                showIcon
                message="Não foi possível carregar os módulos existentes. Você pode continuar sem selecionar uma raiz, usando o nome do arquivo."
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
                message="Nenhum módulo raiz cadastrado. A importação criará uma raiz com o nome do arquivo."
              />
            )}
            <Typography.Paragraph>
              Use os números escritos no DOCX. As questões anteriores à inicial
              serão ignoradas e a questão final será incluída por completo.
            </Typography.Paragraph>
            <Flex gap={16} wrap>
              <Form.Item
                label="Questão inicial (opcional)"
                extra="Em branco, começa na questão 1."
                style={{ flex: "1 1 220px", minWidth: 0 }}
              >
                <InputNumber
                  aria-label="Questão inicial"
                  placeholder="1"
                  min={1}
                  max={MAX_QUESTION_NUMBER}
                  step={1}
                  inputMode="numeric"
                  value={startQuestionNumber}
                  onChange={setStartQuestionNumber}
                  disabled={busy}
                  style={{ width: "100%" }}
                />
              </Form.Item>
              <Form.Item
                label="Questão final (opcional)"
                extra="Em branco, segue até o fim do documento."
                style={{ flex: "1 1 220px", minWidth: 0 }}
              >
                <InputNumber
                  aria-label="Questão final"
                  placeholder="Até o fim"
                  min={1}
                  max={MAX_QUESTION_NUMBER}
                  step={1}
                  inputMode="numeric"
                  value={endQuestionNumber}
                  onChange={setEndQuestionNumber}
                  disabled={busy}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Flex>
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
        {file && !retryId && !rootModuleId && (
          <Typography.Paragraph type="secondary">
            Módulo raiz pelo nome do arquivo:{" "}
            <strong>
              {file.name
                .replace(/\.docx$/i, "")
                .normalize("NFKC")
                .trim()
                .replace(/\s+/g, " ")}
            </strong>
            . Uma raiz existente com esse nome será reaproveitada; caso
            contrário, uma nova será criada.
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
            disabled={!file}
          >
            {retryId ? "Enviar nova tentativa" : "Importar questões"}
          </Button>
        </Flex>
      </Form>
    </Card>
  );
}
