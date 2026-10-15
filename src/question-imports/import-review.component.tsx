"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  App,
  Button,
  Card,
  Checkbox,
  Empty,
  Flex,
  Pagination,
  Progress,
  Select,
  Spin,
  Typography,
} from "antd";
import { useUser } from "@/app/context/user.context";
import type { QuestionImport } from "./question-import.model";
import type {
  ImportItem,
  ImportMutationResult,
  ItemFilters,
  ReviewStatus,
} from "./import-preview.model";
import {
  canApproveItem,
  canEditImport,
  canEditItem,
  reviewLabels,
  validityLabels,
} from "./import-preview.rules";
import {
  draftErrorMessage,
  importErrorMessage,
  importErrorStatus,
  loadImportItems,
  loadImportModulePaths,
  loadImportRoots,
  revalidateImportItem,
  reviewImportItem,
} from "./question-import.api";
import { ImportItemView } from "./import-item-view.component";
import { ImportItemDialog } from "./import-item-editor.component";
import { ImportErrorsDialog } from "./import-errors-dialog.component";
import { ImportConfirmation } from "./import-confirmation.component";
import {
  ImportReviewNavigation,
  useReviewPageNavigation,
} from "./import-review-navigation";

interface ReviewResult {
  order: number;
  number: number;
  status: "success" | "error" | "skipped";
  message: string;
}

export function ImportReview({ batch }: { batch: QuestionImport }) {
  const { user } = useUser();
  const cache = useQueryClient();
  const { modal } = App.useApp();
  const [filters, setFilters] = useState<ItemFilters>({
    page: 1,
    pageSize: 10,
  });
  const [selected, setSelected] = useState<string[]>([]);
  const [itemId, setItemId] = useState<string>();
  const [errorsOpen, setErrorsOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [processed, setProcessed] = useState(0);
  const [actionTotal, setActionTotal] = useState(0);
  const [results, setResults] = useState<ReviewResult[]>([]);
  const locked = useRef(false);
  const mounted = useRef(true);
  const scope = ["import-review", user?.id, batch.id];
  const items = useQuery({
    queryKey: [...scope, "items", filters],
    queryFn: ({ signal }) => loadImportItems(batch.id, filters, signal),
    retry: false,
    refetchInterval: 10 * 60 * 1000,
  });
  const modules = useQuery({
    queryKey: [...scope, "modules"],
    queryFn: ({ signal }) => loadImportModulePaths(batch.id, signal),
    retry: false,
  });
  const roots = useQuery({
    queryKey: ["question-import-roots", user?.id],
    queryFn: ({ signal }) => loadImportRoots(signal),
    retry: false,
  });
  const editable = canEditImport(batch) && !items.isError;
  const rows = items.data?.items ?? [];
  const navigationKey = JSON.stringify([user?.id, batch.id, filters]);
  const { startRef, endRef, requestScroll, cancelScroll, redirectScroll } =
    useReviewPageNavigation(
      navigationKey,
      items.isSuccess &&
        !items.isPlaceholderData &&
        items.data.page === filters.page &&
        items.data.pageSize === filters.pageSize &&
        filters.page <= Math.max(1, items.data.totalPages),
    );

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    if (!busy) return;
    const beforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [busy]);

  useEffect(() => {
    if (items.data && filters.page > Math.max(1, items.data.totalPages)) {
      const next = { ...filters, page: Math.max(1, items.data.totalPages) };
      redirectScroll(JSON.stringify([user?.id, batch.id, next]));
      setFilters(next);
    }
  }, [items.data, filters, user?.id, batch.id, redirectScroll]);

  function changeFilters(next: Partial<ItemFilters>) {
    cancelScroll();
    setFilters((old) => ({ ...old, ...next, page: 1 }));
    setSelected([]);
  }
  async function refresh() {
    await Promise.all([
      cache.invalidateQueries({ queryKey: scope }),
      cache.invalidateQueries({
        queryKey: ["question-import", user?.id, batch.id],
      }),
    ]);
  }
  function saved(result: ImportMutationResult) {
    cache.setQueryData([...scope, "item", result.item.id], result);
    cache.setQueryData<QuestionImport>(
      ["question-import", user?.id, batch.id],
      (old) => (old ? { ...old, summary: result.summary } : old),
    );
    void refresh();
  }

  async function act(targets: ImportItem[], review?: ReviewStatus) {
    if (locked.current || !editable) return;
    locked.current = true;
    setBusy(true);
    setProcessed(0);
    setResults([]);
    setActionTotal(targets.length);
    const outcomes: ReviewResult[] = [];
    try {
      for (const item of targets) {
        if (!mounted.current) break;
        if (
          !canEditItem(item) ||
          (review === "APPROVED" && !canApproveItem(item))
        ) {
          outcomes.push({
            order: item.itemOrder,
            number: item.sourceNumber ?? item.itemOrder,
            status: "skipped",
            message: "Questão ignorada: não está disponível para esta ação.",
          });
        } else {
          try {
            if (review)
              await reviewImportItem(batch.id, item.id, item.version, review);
            else await revalidateImportItem(batch.id, item.id, item.version);
            outcomes.push({
              order: item.itemOrder,
              number: item.sourceNumber ?? item.itemOrder,
              status: "success",
              message: review ? reviewLabels[review] : "Revalidada",
            });
          } catch (cause) {
            outcomes.push({
              order: item.itemOrder,
              number: item.sourceNumber ?? item.itemOrder,
              status: "error",
              message: draftErrorMessage(cause),
            });
            if ([401, 403].includes(importErrorStatus(cause) ?? 0)) {
              for (const remaining of targets.slice(outcomes.length))
                outcomes.push({
                  order: remaining.itemOrder,
                  number: remaining.sourceNumber ?? remaining.itemOrder,
                  status: "skipped",
                  message: "Ação interrompida; confira sua sessão e acesso.",
                });
              break;
            }
          }
        }
        setProcessed(outcomes.length);
      }
    } finally {
      setResults(outcomes);
      setSelected([]);
      try {
        await refresh();
      } finally {
        setBusy(false);
        locked.current = false;
      }
    }
  }
  function confirmExclude(targets: ImportItem[]) {
    modal.confirm({
      title: `Excluir ${targets.length} questão(ões) da revisão?`,
      content: "Os rascunhos continuam visíveis e poderão ser restaurados.",
      okText: "Excluir da revisão",
      cancelText: "Cancelar",
      onOk: () => act(targets, "EXCLUDED"),
    });
  }
  const selection = rows.filter((item) => selected.includes(item.id));
  const approvable = selection.filter(canApproveItem);

  return (
    <Flex vertical gap={20} className="import-review-navigation-space">
      <ImportReviewNavigation startRef={startRef} endRef={endRef} />
      <ImportConfirmation batch={batch} />
      <Flex gap={12} wrap>
        <Button onClick={() => setErrorsOpen(true)}>
          {batch.summary.errorCount} erros encontrados
        </Button>
        <Button onClick={() => setErrorsOpen(true)}>Erros e avisos</Button>
        <Button
          loading={items.isFetching}
          disabled={busy || Boolean(itemId)}
          onClick={() => void refresh()}
        >
          Atualizar questões e imagens
        </Button>
        <Typography.Text>
          {batch.summary.approvedItems} aprovadas ·{" "}
          {batch.summary.pendingReviewItems} pendentes ·{" "}
          {batch.summary.excludedItems} excluídas
        </Typography.Text>
      </Flex>
      {!canEditImport(batch) && (
        <Alert
          type="info"
          showIcon
          message="Este lote está disponível somente para consulta."
        />
      )}
      <Card size="small" title="Filtrar questões">
        <Flex gap={12} wrap>
          <Select
            aria-label="Filtrar por validade"
            placeholder="Todas as validades"
            allowClear
            style={{ minWidth: "min(210px, 100%)", maxWidth: "100%" }}
            disabled={busy}
            value={filters.validationStatus}
            onChange={(value) => changeFilters({ validationStatus: value })}
            options={Object.entries(validityLabels).map(([value, label]) => ({
              value,
              label,
            }))}
          />
          <Select
            aria-label="Filtrar por revisão"
            placeholder="Todas as revisões"
            allowClear
            style={{ minWidth: "min(210px, 100%)", maxWidth: "100%" }}
            disabled={busy}
            value={filters.reviewStatus}
            onChange={(value) => changeFilters({ reviewStatus: value })}
            options={Object.entries(reviewLabels).map(([value, label]) => ({
              value,
              label,
            }))}
          />
          <Select
            aria-label="Filtrar por módulo"
            placeholder="Todos os módulos"
            allowClear
            showSearch
            optionFilterProp="label"
            style={{ minWidth: "min(230px, 100%)", maxWidth: "100%", flex: 1 }}
            loading={modules.isFetching}
            disabled={busy || modules.isError}
            value={
              filters.modulePath
                ? JSON.stringify(filters.modulePath)
                : undefined
            }
            onChange={(value) =>
              changeFilters({
                modulePath: value ? JSON.parse(value) : undefined,
              })
            }
            options={modules.data?.map((entry) => ({
              value: JSON.stringify(entry.modulePath),
              label: `${entry.modulePath.join(" › ") || "Sem módulo"} (${entry.count})`,
              // An empty array cannot be represented by repeated query parameters.
              disabled: entry.modulePath.length === 0,
            }))}
          />
          <Checkbox
            checked={filters.hasWarnings === true}
            disabled={busy}
            onChange={(event) =>
              changeFilters({
                hasWarnings: event.target.checked ? true : undefined,
              })
            }
          >
            Com avisos
          </Checkbox>
          <Button
            disabled={busy}
            onClick={() => {
              cancelScroll();
              setFilters({ page: 1, pageSize: filters.pageSize });
              setSelected([]);
            }}
          >
            Limpar filtros
          </Button>
        </Flex>
        {modules.isError && (
          <Alert
            style={{ marginTop: 12 }}
            type="warning"
            message="Não foi possível carregar os módulos para filtro."
            action={
              <Button onClick={() => modules.refetch()}>
                Tentar novamente
              </Button>
            }
          />
        )}
      </Card>
      <Flex gap={12} wrap align="center">
        <Checkbox
          disabled={busy || !editable || !rows.some(canEditItem)}
          checked={
            rows.filter(canEditItem).length > 0 &&
            rows.filter(canEditItem).every((item) => selected.includes(item.id))
          }
          onChange={(event) =>
            setSelected(
              event.target.checked
                ? rows.filter(canEditItem).map((item) => item.id)
                : [],
            )
          }
        >
          Selecionar esta página
        </Checkbox>
        <Typography.Text>{selection.length} selecionadas</Typography.Text>
        <Button
          disabled={busy || !editable || !approvable.length}
          onClick={() => void act(approvable, "APPROVED")}
        >
          Aprovar válidas selecionadas ({approvable.length})
        </Button>
        <Button
          disabled={busy || !editable || !selection.length}
          onClick={() => void act(selection, "PENDING")}
        >
          Marcar pendentes
        </Button>
        <Button
          danger
          disabled={busy || !editable || !selection.length}
          onClick={() => confirmExclude(selection)}
        >
          Excluir selecionadas
        </Button>
      </Flex>
      {busy && (
        <div role="status">
          <Spin /> Processando revisão: {processed} de {actionTotal}{" "}
          questão(ões)
          <Progress
            percent={
              actionTotal
                ? Math.min(100, Math.round((processed / actionTotal) * 100))
                : 0
            }
          />
        </div>
      )}
      {results.length > 0 && (
        <Alert
          type={
            results.some((result) => result.status === "error")
              ? "warning"
              : "success"
          }
          showIcon
          message={`${results.filter((result) => result.status === "success").length} atualizadas; ${results.filter((result) => result.status === "error").length} falharam; ${results.filter((result) => result.status === "skipped").length} ignoradas.`}
          description={
            <details>
              <summary>Ver resultado por questão</summary>
              {results.map((result) => (
                <p key={result.order}>
                  Questão {result.number}: {result.message}
                </p>
              ))}
            </details>
          }
        />
      )}
      <div ref={startRef} className="import-review-list-start" />
      {items.isPending && <Spin />}
      {items.isError && (
        <Alert
          type="error"
          showIcon
          message={importErrorMessage(items.error)}
          action={
            <Button onClick={() => items.refetch()}>Tentar novamente</Button>
          }
        />
      )}
      {!items.isError && items.data && (
        <>
          {items.data.assetErrors.length > 0 && (
            <Alert
              showIcon
              type="warning"
              message="Algumas imagens estão temporariamente indisponíveis. As questões continuam acessíveis; use Atualizar questões e imagens para tentar novamente."
            />
          )}
          {!rows.length && (
            <Empty description="Nenhuma questão corresponde aos filtros." />
          )}
          {rows.map((item) => (
            <Card
              key={item.id}
              className="import-item-card"
              title={
                <Flex gap={12}>
                  <Checkbox
                    aria-label={`Selecionar questão ${item.sourceNumber ?? item.itemOrder}`}
                    disabled={busy || !editable || !canEditItem(item)}
                    checked={selected.includes(item.id)}
                    onChange={(event) =>
                      setSelected((old) =>
                        event.target.checked
                          ? [...old, item.id]
                          : old.filter((id) => id !== item.id),
                      )
                    }
                  />
                  <span>Questão {item.sourceNumber ?? item.itemOrder}</span>
                </Flex>
              }
            >
              <ImportItemView item={item} imageUrls={items.data.imageUrls} />
              <Flex gap={8} wrap style={{ marginTop: 16 }}>
                <Button disabled={busy} onClick={() => setItemId(item.id)}>
                  {editable && canEditItem(item)
                    ? "Revisar / editar"
                    : "Visualizar"}
                </Button>
                <Button
                  disabled={
                    busy ||
                    !editable ||
                    !canApproveItem(item) ||
                    item.reviewStatus === "APPROVED"
                  }
                  type="primary"
                  onClick={() => void act([item], "APPROVED")}
                >
                  Aprovar
                </Button>
                <Button
                  disabled={busy || !editable || !canEditItem(item)}
                  onClick={() => void act([item])}
                >
                  Revalidar
                </Button>
                {item.reviewStatus !== "EXCLUDED" && (
                  <Button
                    danger
                    disabled={busy || !editable || !canEditItem(item)}
                    onClick={() => confirmExclude([item])}
                  >
                    Excluir
                  </Button>
                )}
                {item.reviewStatus !== "PENDING" && (
                  <Button
                    disabled={busy || !editable || !canEditItem(item)}
                    onClick={() => void act([item], "PENDING")}
                  >
                    {item.reviewStatus === "EXCLUDED"
                      ? "Restaurar revisão"
                      : "Retirar aprovação"}
                  </Button>
                )}
              </Flex>
            </Card>
          ))}
          <div ref={endRef} className="import-review-pagination">
            <Pagination
              current={filters.page}
              pageSize={filters.pageSize}
              total={items.data.total}
              pageSizeOptions={[10, 20, 50]}
              showSizeChanger
              showTotal={(total) => `${total} questões`}
              disabled={busy}
              responsive
              onChange={(page, pageSize) => {
                if (page === filters.page && pageSize === filters.pageSize) return;
                const next = { ...filters, page, pageSize };
                requestScroll(JSON.stringify([user?.id, batch.id, next]));
                setFilters(next);
                setSelected([]);
              }}
            />
          </div>
        </>
      )}
      {(!items.data || items.isError) && <div ref={endRef} />}
      {errorsOpen && (
        <ImportErrorsDialog
          importId={batch.id}
          onClose={() => setErrorsOpen(false)}
          onOpenItem={(id) => {
            setErrorsOpen(false);
            setItemId(id);
          }}
        />
      )}
      {itemId && (
        <ImportItemDialog
          key={itemId}
          importId={batch.id}
          itemId={itemId}
          rootName={
            roots.data?.find((root) => root.id === batch.rootModuleId)?.name
          }
          startQuestionNumber={batch.startQuestionNumber ?? 1}
          editable={editable && !busy}
          onClose={() => setItemId(undefined)}
          onSaved={saved}
        />
      )}
    </Flex>
  );
}
