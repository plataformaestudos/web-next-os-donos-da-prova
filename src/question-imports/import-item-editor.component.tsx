"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  App,
  Button,
  Checkbox,
  Divider,
  Flex,
  Input,
  InputNumber,
  Modal,
  Select,
  Spin,
  Typography,
} from "antd";
import { useUser } from "@/app/context/user.context";
import type {
  DraftField,
  DraftPayload,
  ImportItemDetail,
  ImportMutationResult,
} from "./import-preview.model";
import { buildDraftPatch, canEditItem } from "./import-preview.rules";
import {
  draftErrorMessage,
  importErrorCode,
  importErrorMessage,
  importErrorStatus,
  loadImportItem,
  updateImportItem,
} from "./question-import.api";
import { ImportRichEditor } from "./import-rich-editor.component";
import { ImportItemView } from "./import-item-view.component";

export function ImportItemDialog({
  importId,
  itemId,
  rootName,
  startQuestionNumber = 1,
  editable,
  onClose,
  onSaved,
}: {
  importId: string;
  itemId: string;
  rootName?: string;
  startQuestionNumber?: number;
  editable: boolean;
  onClose: () => void;
  onSaved: (result: ImportMutationResult) => void;
}) {
  const { user } = useUser();
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const { modal } = App.useApp();
  const detail = useQuery({
    queryKey: ["import-review", user?.id, importId, "item", itemId],
    queryFn: ({ signal }) => loadImportItem(importId, itemId, signal),
    retry: false,
    refetchInterval: 10 * 60 * 1000,
  });
  const forbidden =
    detail.isError &&
    [401, 403, 404].includes(importErrorStatus(detail.error) ?? 0);

  function close() {
    if (saving) return;
    if (dirty)
      modal.confirm({
        title: "Descartar alterações não salvas?",
        content: "O rascunho salvo continuará disponível.",
        okText: "Descartar",
        cancelText: "Continuar editando",
        onOk: onClose,
      });
    else onClose();
  }
  useEffect(() => {
    if (!dirty && !saving) return;
    const beforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [dirty, saving]);

  return (
    <Modal
      open
      title="Revisar questão"
      width={1000}
      onCancel={close}
      footer={null}
      maskClosable={false}
      keyboard={!saving}
      closable={!saving}
    >
      {detail.isError && (
        <Alert
          showIcon
          type="error"
          message={importErrorMessage(detail.error)}
          action={<Button onClick={() => detail.refetch()}>Atualizar</Button>}
        />
      )}
      {detail.isPending && <Spin />}
      {!forbidden && detail.data && (
        <EditorForm
          key={itemId}
          detail={detail.data}
          rootName={rootName}
          startQuestionNumber={startQuestionNumber}
          importId={importId}
          editable={editable && !detail.isError}
          onDirty={setDirty}
          onSaving={setSaving}
          onSaved={onSaved}
          onClose={close}
        />
      )}
    </Modal>
  );
}

function EditorForm({
  detail,
  rootName,
  startQuestionNumber,
  importId,
  editable,
  onDirty,
  onSaving,
  onSaved,
  onClose,
}: {
  detail: ImportItemDetail;
  rootName?: string;
  startQuestionNumber: number;
  importId: string;
  editable: boolean;
  onDirty: (dirty: boolean) => void;
  onSaving: (saving: boolean) => void;
  onSaved: (result: ImportMutationResult) => void;
  onClose: () => void;
}) {
  const [base, setBase] = useState(detail);
  const [draft, setDraft] = useState(detail.item);
  const [reviewed, setReviewed] = useState<DraftField[]>([]);
  const [revision, setRevision] = useState(0);
  const [error, setError] = useState<string>();
  const [conflict, setConflict] = useState<ImportItemDetail>();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loadingLatest, setLoadingLatest] = useState(false);
  const locked = useRef(false);
  const { modal } = App.useApp();
  const writable =
    editable && canEditItem(base.item) && canEditItem(detail.item);
  const disabled = !writable || busy;
  const imageUrls = { ...base.imageUrls, ...detail.imageUrls };
  useEffect(() => {
    onDirty(reviewed.length > 0);
  }, [reviewed, onDirty]);

  function mark(field: DraftField) {
    setReviewed((old) => (old.includes(field) ? old : [...old, field]));
    setSaved(false);
  }
  function payload<K extends keyof DraftPayload>(
    field: K,
    value: DraftPayload[K],
  ) {
    setDraft((old) => ({
      ...old,
      payload: { ...old.payload, [field]: value },
    }));
    mark(field);
  }
  function reset(next: ImportItemDetail) {
    setBase(next);
    setDraft(next.item);
    setReviewed([]);
    setRevision((old) => old + 1);
    setError(undefined);
    setConflict(undefined);
  }
  async function loadLatest() {
    setLoadingLatest(true);
    try {
      setConflict(await loadImportItem(importId, base.item.id));
    } catch (cause) {
      setError(importErrorMessage(cause));
    } finally {
      setLoadingLatest(false);
    }
  }
  async function save() {
    if (locked.current || !reviewed.length || !writable || conflict) return;
    locked.current = true;
    setBusy(true);
    onSaving(true);
    setError(undefined);
    setSaved(false);
    try {
      const result = await updateImportItem(
        importId,
        base.item.id,
        buildDraftPatch(base.item, draft, reviewed),
      );
      reset(result);
      setSaved(true);
      onSaved(result);
    } catch (cause) {
      setError(draftErrorMessage(cause));
      // Keep both local content and the original version until the user explicitly reconciles.
      if (importErrorCode(cause) === "IMPORT_ITEM_VERSION_CONFLICT")
        await loadLatest();
    } finally {
      locked.current = false;
      setBusy(false);
      onSaving(false);
    }
  }
  function field(name: DraftField, label: string, children: ReactNode) {
    return (
      <div key={name}>
        <Flex justify="space-between" wrap gap={8}>
          <Typography.Text strong>{label}</Typography.Text>
          <Checkbox
            checked={reviewed.includes(name)}
            disabled={disabled || reviewed.includes(name)}
            onChange={() => mark(name)}
          >
            Campo revisado
          </Checkbox>
        </Flex>
        {children}
      </div>
    );
  }
  const rich = (name: "text" | "comment", label: string) =>
    field(
      name,
      label,
      <ImportRichEditor
        key={`${revision}-${name}`}
        label={label}
        html={draft.payload[name]}
        imageUrls={imageUrls}
        disabled={disabled}
        onChange={(html) => payload(name, html)}
      />,
    );
  const saveButton = writable && (
    <Button
      type="primary"
      loading={busy}
      disabled={!reviewed.length || Boolean(conflict)}
      onClick={save}
    >
      Salvar e revalidar
    </Button>
  );

  return (
    <Flex vertical gap={18}>
      <Flex align="center" justify="space-between" gap={12} wrap>
        <Typography.Title level={4} style={{ margin: 0 }}>
          Questão {base.item.sourceNumber ?? base.item.itemOrder}
        </Typography.Title>
        {saveButton}
      </Flex>
      {!writable && (
        <Alert type="info" message="Questão disponível somente para leitura." />
      )}
      {saved && (
        <Alert
          type="success"
          showIcon
          message="Rascunho atualizado e revalidado. Confira os erros e aprove a questão quando estiver pronta."
        />
      )}
      {error && (
        <Alert
          type="error"
          showIcon
          message={error}
          action={
            <Button
              loading={loadingLatest}
              disabled={busy}
              onClick={loadLatest}
            >
              Consultar versão atual
            </Button>
          }
        />
      )}
      {detail.item.version > base.item.version && !conflict && (
        <Alert
          type="warning"
          message="Há uma versão mais recente desta questão. Suas alterações locais foram preservadas."
          action={
            <Button loading={loadingLatest} onClick={loadLatest}>
              Consultar versão atual
            </Button>
          }
        />
      )}
      {conflict && (
        <Alert
          type="warning"
          message="Versão atual disponível para comparação. Sua edição local foi preservada."
          description={
            <>
              <Typography.Paragraph>
                Compare com a versão atual abaixo. Copie as alterações que
                deseja reaplicar antes de carregar a versão atual.
              </Typography.Paragraph>
              <details>
                <summary>Visualizar versão atual no servidor</summary>
                <ImportItemView
                  item={conflict.item}
                  imageUrls={conflict.imageUrls}
                />
              </details>
              <Button
                onClick={() =>
                  modal.confirm({
                    title: "Substituir a edição local pela versão atual?",
                    content:
                      "Alterações locais ainda não salvas serão descartadas. Nenhum conteúdo será enviado automaticamente.",
                    okText: "Carregar versão atual",
                    cancelText: "Continuar comparando",
                    onOk: () => reset(conflict),
                  })
                }
              >
                Carregar versão atual
              </Button>
            </>
          }
        />
      )}
      {detail.assetErrors.length > 0 && (
        <Alert
          type="warning"
          message="Algumas imagens estão indisponíveis. As referências continuam preservadas ao editar."
        />
      )}
      {field(
        "sourceNumber",
        "Número no DOCX",
        <>
          <InputNumber
            aria-label="Número no DOCX"
            min={1}
            max={2147483647}
            precision={0}
            value={draft.sourceNumber}
            disabled={disabled}
            onChange={(value) => {
              setDraft((old) => ({ ...old, sourceNumber: value }));
              mark("sourceNumber");
            }}
          />
          <Typography.Text type="secondary">
            {" "}
            Número esperado: {startQuestionNumber + base.item.itemOrder - 1}
          </Typography.Text>
        </>,
      )}
      {rich("text", "Enunciado")}
      {field(
        "type",
        "Tipo da questão",
        <Select
          aria-label="Tipo da questão"
          style={{ width: "100%" }}
          value={draft.payload.type}
          disabled={disabled}
          onChange={(value) => payload("type", value)}
          options={[
            { value: "MULTIPLE_CHOICE", label: "Múltipla escolha" },
            { value: "RIGHT_OR_WRONG", label: "Certo ou errado" },
          ]}
          placeholder="Selecione o tipo"
        />,
      )}
      {field(
        "alternatives",
        "Alternativas",
        <Flex vertical gap={12}>
          {draft.payload.alternatives.map((alternative, index) => (
            <div key={`${revision}-${index}`}>
              <Flex justify="space-between">
                <Typography.Text strong>
                  Alternativa {String.fromCharCode(65 + index)}
                </Typography.Text>
                <Button
                  disabled={disabled}
                  danger
                  onClick={() => {
                    const currentAnswer = draft.payload.answer?.charCodeAt(0);
                    const answerIndex =
                      currentAnswer === undefined ? -1 : currentAnswer - 65;
                    setDraft((old) => ({
                      ...old,
                      payload: {
                        ...old.payload,
                        alternatives: old.payload.alternatives.filter(
                          (_, i) => i !== index,
                        ),
                        answer:
                          answerIndex === index
                            ? null
                            : answerIndex > index
                              ? String.fromCharCode(64 + answerIndex)
                              : old.payload.answer,
                      },
                    }));
                    mark("alternatives");
                    if (answerIndex >= index) mark("answer");
                    setRevision((old) => old + 1);
                  }}
                >
                  Remover
                </Button>
              </Flex>
              <ImportRichEditor
                label={`Alternativa ${String.fromCharCode(65 + index)}`}
                html={alternative.text}
                imageUrls={imageUrls}
                disabled={disabled}
                onChange={(html) =>
                  payload(
                    "alternatives",
                    draft.payload.alternatives.map((option, i) =>
                      i === index ? { text: html } : option,
                    ),
                  )
                }
              />
            </div>
          ))}
          <Button
            disabled={disabled || draft.payload.alternatives.length >= 10}
            onClick={() =>
              payload("alternatives", [
                ...draft.payload.alternatives,
                { text: "" },
              ])
            }
          >
            Adicionar alternativa
          </Button>
        </Flex>,
      )}
      {field(
        "answer",
        "Resposta correta",
        <Select
          aria-label="Resposta correta"
          style={{ width: "100%" }}
          allowClear
          value={draft.payload.answer}
          placeholder="Selecione a resposta"
          disabled={disabled}
          onChange={(value) => payload("answer", value ?? null)}
          options={draft.payload.alternatives.map((_, index) => ({
            value: String.fromCharCode(65 + index),
            label: `Alternativa ${String.fromCharCode(65 + index)}`,
          }))}
        />,
      )}
      {rich("comment", "Comentário obrigatório")}
      {field(
        "difficultyLevel",
        "Dificuldade (1–10)",
        <InputNumber
          aria-label="Dificuldade"
          min={1}
          max={10}
          precision={0}
          value={draft.payload.difficultyLevel}
          disabled={disabled}
          onChange={(value) => {
            if (value !== null) payload("difficultyLevel", value);
          }}
        />,
      )}
      {field(
        "modulePath",
        "Caminho do módulo (um nome por linha, começando pela raiz)",
        <>
          <Typography.Paragraph type="secondary">
            Raiz da importação:{" "}
            {rootName || "consulte o caminho identificado abaixo"}. A resolução
            acontece nessa raiz; módulos inexistentes só serão criados na
            confirmação.
          </Typography.Paragraph>
          <Input.TextArea
            aria-label="Caminho do módulo"
            rows={4}
            value={draft.modulePath.join("\n")}
            disabled={disabled}
            onChange={(event) => {
              setDraft((old) => ({
                ...old,
                modulePath: event.target.value.split("\n"),
              }));
              mark("modulePath");
            }}
          />
        </>,
      )}
      <Typography.Paragraph type="secondary">
        Somente campos alterados ou marcados como revisados são reenviados. Você
        pode guardar um rascunho incompleto; erros impedem a aprovação. Editar
        uma questão aprovada exige nova aprovação.
      </Typography.Paragraph>
      {base.item.issues.map((issue, index) => (
        <Alert
          key={index}
          type={issue.severity === "ERROR" ? "error" : "warning"}
          message={issue.message}
          description={issue.suggestedFix}
        />
      ))}
      <Divider />
      <Flex gap={12} justify="end" wrap>
        <Button onClick={onClose} disabled={busy}>
          Fechar
        </Button>
        {saveButton}
      </Flex>
    </Flex>
  );
}
