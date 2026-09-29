"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Button,
  Card,
  Flex,
  List,
  Modal,
  Progress,
  Statistic,
  Typography,
} from "antd";
import { useUser } from "@/app/context/user.context";
import type { QuestionImport } from "./question-import.model";
import type {
  ImportConfirmationItemResult,
  ImportConfirmationResult,
  ImportItem,
  ImportItemsPage,
} from "./import-preview.model";
import {
  confirmImportItems,
  importErrorMessage,
  importErrorStatus,
  loadImportItems,
} from "./question-import.api";
import { canApproveItem, canEditImport } from "./import-preview.rules";

const PAGE_SIZE = 100;
const BATCH_SIZE = 20;
type ConfirmationDisplayItemResult = Omit<
  ImportConfirmationItemResult,
  "outcome"
> & { outcome: ImportConfirmationItemResult["outcome"] | "UNKNOWN" };

async function loadAllItems(importId: string): Promise<ImportItem[]> {
  const first = await loadImportItems(importId, {
    page: 1,
    pageSize: PAGE_SIZE,
  });
  if (first.totalPages <= 1) return first.items;
  const pages = await Promise.all(
    Array.from({ length: first.totalPages - 1 }, (_, index) =>
      loadImportItems(importId, {
        page: index + 2,
        pageSize: PAGE_SIZE,
      }),
    ),
  );
  return [first, ...pages].flatMap((page) => page.items);
}

function isConfirmationCandidate(item: ImportItem) {
  return (
    canApproveItem(item) &&
    item.reviewStatus === "APPROVED" &&
    ["PENDING", "FAILED"].includes(item.persistenceStatus)
  );
}

function outcomeLabel(result: ConfirmationDisplayItemResult) {
  if (result.outcome === "SAVED") return "Salva";
  if (result.outcome === "UNKNOWN") return "Resultado não confirmado";
  if (result.outcome === "FAILED") return "Falha";
  if (result.code === "ALREADY_SAVED") return "Já estava salva";
  return "Ignorada";
}

function rowDescription(result: ConfirmationDisplayItemResult) {
  return `Questão ${result.itemOrder ?? "—"} · ${outcomeLabel(result)} · ${result.message}`;
}

export function ImportConfirmation({ batch }: { batch: QuestionImport }) {
  const { user } = useUser();
  const cache = useQueryClient();
  const [open, setOpen] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [items, setItems] = useState<ImportItem[]>([]);
  const [results, setResults] = useState<ConfirmationDisplayItemResult[]>([]);
  const [processed, setProcessed] = useState(0);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const [summaryUnavailable, setSummaryUnavailable] = useState(false);
  const [failedRetryCount, setFailedRetryCount] = useState(
    batch.summary.failedItems,
  );
  const [failedOnly, setFailedOnly] = useState(false);
  const lock = useRef(false);
  const scope = ["import-review", user?.id, batch.id];
  const candidates = useMemo(
    () =>
      items.filter(
        (item) =>
          isConfirmationCandidate(item) &&
          (!failedOnly || item.persistenceStatus === "FAILED"),
      ),
    [items, failedOnly],
  );
  const savedCount = items.filter(
    (item) => item.persistenceStatus === "SAVED",
  ).length;
  const savingCount = items.filter(
    (item) => item.persistenceStatus === "SAVING",
  ).length;
  const ignoredCount = Math.max(
    0,
    items.length - candidates.length - savedCount - savingCount,
  );
  const pendingCount = items.filter(
    (item) =>
      item.persistenceStatus !== "SAVED" &&
      item.persistenceStatus !== "SAVING" &&
      item.reviewStatus !== "EXCLUDED" &&
      !isConfirmationCandidate(item),
  ).length;
  const deferredCount = failedOnly
    ? items.filter(
        (item) =>
          item.persistenceStatus === "PENDING" && isConfirmationCandidate(item),
      ).length
    : 0;

  useEffect(() => {
    if (!busy) return;
    const beforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [busy]);

  function updateCachedItems(response: ImportConfirmationResult) {
    const itemResults = new Map(
      response.results.map((result) => [result.itemId, result]),
    );
    cache.setQueriesData<ImportItemsPage>(
      { queryKey: [...scope, "items"] },
      (page) => {
        if (!page) return page;
        return {
          ...page,
          items: page.items.map((item) => {
            const result = itemResults.get(item.id);
            if (!result) return item;
            const next = {
              ...item,
              version: result.currentVersion ?? item.version,
            };
            if (result.outcome === "SAVED" || result.code === "ALREADY_SAVED")
              return {
                ...next,
                persistenceStatus: "SAVED" as const,
                savedQuestionId: result.questionId ?? item.savedQuestionId,
                saveError: null,
              };
            if (
              result.outcome === "FAILED" &&
              result.code !== "SAVE_RESULT_UNAVAILABLE"
            )
              return {
                ...next,
                persistenceStatus: "FAILED" as const,
                saveError: {
                  code: result.code,
                  severity: "ERROR" as const,
                  field: "persistence",
                  message: result.message,
                },
              };
            if (result.issues)
              return {
                ...next,
                issues: result.issues,
                validationStatus: "INVALID" as const,
                reviewStatus: "PENDING" as const,
                persistenceStatus: "PENDING" as const,
                saveError: null,
              };
            return next;
          }),
        };
      },
    );
    if (response.summary) {
      cache.setQueryData<QuestionImport>(
        ["question-import", user?.id, batch.id],
        (current) =>
          current
            ? {
                ...current,
                status: response.status ?? current.status,
                summary: response.summary!,
              }
            : current,
      );
    }
  }

  async function refresh() {
    await Promise.all([
      cache.invalidateQueries({ queryKey: scope }),
      cache.invalidateQueries({
        queryKey: ["question-import", user?.id, batch.id],
      }),
    ]);
  }

  async function prepare(retryFailures = false) {
    if (preparing || busy || lock.current) return;
    setPreparing(true);
    setError(undefined);
    setNotice(undefined);
    setResults([]);
    setItems([]);
    setProcessed(0);
    setTotal(0);
    setSummaryUnavailable(false);
    setFailedOnly(retryFailures);
    try {
      const latest = await loadAllItems(batch.id);
      setItems(latest);
      const eligible = latest.filter(
        (item) =>
          isConfirmationCandidate(item) &&
          (!retryFailures || item.persistenceStatus === "FAILED"),
      );
      setFailedRetryCount(
        latest.filter(
          (item) =>
            item.persistenceStatus === "FAILED" &&
            isConfirmationCandidate(item),
        ).length,
      );
      setTotal(eligible.length);
      if (retryFailures && eligible.length === 0)
        setNotice("Não há falhas elegíveis para uma nova tentativa.");
      setOpen(true);
    } catch (cause) {
      setError(importErrorMessage(cause));
      setOpen(true);
    } finally {
      setPreparing(false);
    }
  }

  async function confirm() {
    if (lock.current || busy || !candidates.length || !canEditImport(batch))
      return;
    lock.current = true;
    setBusy(true);
    setError(undefined);
    setNotice(undefined);
    setResults([]);
    setItems([]);
    setProcessed(0);
    setTotal(candidates.length);
    let completed = 0;
    let requestItems: ImportItem[] = [];
    const accumulated: ConfirmationDisplayItemResult[] = [];
    try {
      for (let start = 0; start < candidates.length; start += BATCH_SIZE) {
        requestItems = candidates.slice(start, start + BATCH_SIZE);
        const response = await confirmImportItems(
          batch.id,
          requestItems.map(({ id, version }) => ({ id, version })),
        );
        accumulated.push(...response.results);
        completed += requestItems.length;
        setResults([...accumulated]);
        setProcessed(completed);
        setSummaryUnavailable(response.summaryUnavailable);
        updateCachedItems(response);
      }
      setNotice(
        "Confirmação concluída. Confira o resultado de cada questão abaixo.",
      );
    } catch (cause) {
      setError(
        `${importErrorMessage(cause)} A lista será atualizada para conferir o estado de cada questão antes de uma nova tentativa.`,
      );
      const status = importErrorStatus(cause);
      if ((!status || status >= 500) && requestItems.length) {
        const unknown = requestItems.map((item) => ({
          itemId: item.id,
          itemOrder: item.itemOrder,
          outcome: "UNKNOWN" as const,
          code: "CONFIRMATION_RESULT_UNKNOWN",
          message:
            "A conexão foi interrompida durante este lote; confira o estado atualizado antes de tentar novamente.",
        }));
        accumulated.push(...unknown);
        setResults([...accumulated]);
      }
    } finally {
      try {
        const latest = await loadAllItems(batch.id);
        setItems(latest);
        setFailedRetryCount(
          latest.filter(
            (item) =>
              item.persistenceStatus === "FAILED" &&
              isConfirmationCandidate(item),
          ).length,
        );
      } catch {
        setNotice(
          "Não foi possível atualizar todas as questões. Use Atualizar questões e imagens para consultar o estado antes de tentar novamente.",
        );
      }
      try {
        await refresh();
      } catch {
        setNotice(
          "O salvamento terminou, mas a atualização automática da tela falhou. Atualize a página para consultar o estado persistido.",
        );
      } finally {
        setBusy(false);
        lock.current = false;
      }
    }
  }

  const canSave = canEditImport(batch);
  return (
    <>
      <Card size="small" title="Salvar questões no sistema">
        <Flex gap={12} align="center" wrap>
          <Button
            type="primary"
            loading={preparing}
            disabled={!canSave || busy}
            onClick={() => void prepare(false)}
          >
            Salvar questões válidas
          </Button>
          {failedRetryCount > 0 && canSave && (
            <Button
              loading={preparing || busy}
              disabled={preparing || busy}
              onClick={() => void prepare(true)}
            >
              Tentar novamente apenas as {failedRetryCount} falhas
            </Button>
          )}
          <Typography.Text type="secondary">
            Somente questões aprovadas e válidas serão enviadas. Questões
            pendentes continuam disponíveis para correção.
          </Typography.Text>
        </Flex>
        {!canSave && (
          <Alert
            style={{ marginTop: 12 }}
            type="info"
            message="Este lote não aceita novos salvamentos. As questões já salvas continuam acessíveis abaixo."
          />
        )}
        {error && !open && (
          <Alert
            style={{ marginTop: 12 }}
            type="error"
            showIcon
            message={error}
          />
        )}
        {notice && !open && (
          <Alert
            style={{ marginTop: 12 }}
            type="info"
            showIcon
            message={notice}
          />
        )}
      </Card>

      <Modal
        open={open}
        title={
          results.length ? "Resultado do salvamento" : "Confirmar salvamento"
        }
        width={760}
        maskClosable={!busy}
        keyboard={!busy}
        closable={!busy}
        onCancel={() => {
          if (!busy) setOpen(false);
        }}
        footer={
          <Flex justify="end" gap={8} wrap>
            {failedRetryCount > 0 && !busy && (
              <Button onClick={() => void prepare(true)} loading={preparing}>
                Repetir apenas falhas ({failedRetryCount})
              </Button>
            )}
            {results.length === 0 && (
              <Button
                type="primary"
                loading={busy}
                disabled={preparing || !candidates.length || !canSave}
                onClick={() => void confirm()}
              >
                Confirmar e salvar {candidates.length}
              </Button>
            )}
            <Button disabled={busy} onClick={() => setOpen(false)}>
              {results.length ? "Fechar" : "Cancelar"}
            </Button>
          </Flex>
        }
      >
        {preparing && (
          <Typography.Paragraph>
            Consultando todas as questões…
          </Typography.Paragraph>
        )}
        {error && <Alert type="error" showIcon message={error} />}
        {notice && (
          <Alert
            style={{ marginBottom: 16 }}
            type="info"
            showIcon
            message={notice}
          />
        )}
        {!preparing && items.length > 0 && results.length === 0 && (
          <>
            <Typography.Paragraph>
              {failedOnly
                ? "Somente questões que falharam e continuam aprovadas e válidas serão tentadas novamente."
                : "Revise os totais de todo o documento antes de confirmar. A confirmação é segura para retomar após uma interrupção."}
            </Typography.Paragraph>
            <Flex gap={12} wrap>
              <Statistic title="Serão tentadas" value={candidates.length} />
              <Statistic title="Ignoradas por enquanto" value={ignoredCount} />
              <Statistic title="Já salvas" value={savedCount} />
              <Statistic title="Em salvamento" value={savingCount} />
            </Flex>
            {pendingCount > 0 && (
              <Typography.Paragraph type="secondary" style={{ marginTop: 12 }}>
                {pendingCount} questão(ões) permanecem pendentes de revisão ou
                correção; esse número faz parte das ignoradas e elas continuam
                disponíveis no lote.
              </Typography.Paragraph>
            )}
            {deferredCount > 0 && (
              <Typography.Paragraph type="secondary" style={{ marginTop: 12 }}>
                {deferredCount} questão(ões) válidas aguardam o salvamento
                normal; esta tentativa inclui somente as falhas anteriores.
              </Typography.Paragraph>
            )}
          </>
        )}
        {!preparing && items.length === 0 && !error && (
          <Alert type="info" message="Esta importação não possui questões." />
        )}
        {busy && (
          <div role="status" aria-live="polite" style={{ margin: "16px 0" }}>
            <Typography.Text>
              Salvando lote{" "}
              {Math.min(
                Math.floor(processed / BATCH_SIZE) + 1,
                Math.ceil(total / BATCH_SIZE),
              )}{" "}
              de {Math.ceil(total / BATCH_SIZE)} · {processed} de {total}{" "}
              questões processadas
            </Typography.Text>
            <Progress
              percent={total ? Math.round((processed / total) * 100) : 0}
            />
          </div>
        )}
        {results.length > 0 && (
          <>
            <Flex gap={16} wrap>
              <Statistic
                title="Salvas"
                value={results.filter((row) => row.outcome === "SAVED").length}
              />
              <Statistic
                title="Ignoradas"
                value={
                  results.filter((row) => row.outcome === "IGNORED").length
                }
              />
              <Statistic
                title="Falharam"
                value={results.filter((row) => row.outcome === "FAILED").length}
              />
              <Statistic
                title="Sem resposta confirmada"
                value={
                  results.filter((row) => row.outcome === "UNKNOWN").length
                }
              />
            </Flex>
            {summaryUnavailable && (
              <Alert
                style={{ marginTop: 12 }}
                type="warning"
                showIcon
                message="Os resultados por questão foram recebidos, mas o resumo do lote não pôde ser atualizado. Consulte o estado novamente."
              />
            )}
            <List
              style={{ maxHeight: 420, overflow: "auto", marginTop: 16 }}
              dataSource={results}
              renderItem={(result, index) => (
                <List.Item key={`${result.itemId}-${index}`}>
                  <Flex
                    justify="space-between"
                    gap={12}
                    align="center"
                    wrap
                    style={{ width: "100%" }}
                  >
                    <Typography.Text>{rowDescription(result)}</Typography.Text>
                    {result.questionId && (
                      <Link
                        href={`/questions/view/${result.questionId}`}
                        target="_blank"
                      >
                        Abrir questão
                      </Link>
                    )}
                  </Flex>
                </List.Item>
              )}
            />
          </>
        )}
      </Modal>
    </>
  );
}
