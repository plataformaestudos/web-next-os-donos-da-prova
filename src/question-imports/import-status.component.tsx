"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  Button,
  Card,
  Flex,
  Progress,
  Result,
  Tag,
  Typography,
} from "antd";
import { useUser } from "@/app/context/user.context";
import { FullPageLoading } from "@/ui/loading/full-page-loading";
import { PageLayout } from "@/ui/page-layout/page-layout.component";
import {
  importErrorMessage,
  importErrorStatus,
  loadImport,
} from "./question-import.api";
import {
  hasPreview,
  IMPORT_PATH,
  isImportId,
  isProcessing,
  statusLabels,
} from "./question-import.rules";
import { ImportSummary } from "./import-summary.component";
import { ImportUpload } from "./import-upload.component";

export function ImportStatus({
  id,
  preview = false,
}: {
  id: string;
  preview?: boolean;
}) {
  const { user } = useUser();
  const router = useRouter();
  const validId = isImportId(id);
  const query = useQuery({
    queryKey: ["question-import", user?.id, id],
    queryFn: ({ signal }) => loadImport(id, signal),
    enabled: validId && Boolean(user),
    retry: false,
    refetchInterval: (current) => {
      const status = importErrorStatus(current.state.error);
      if (status && status >= 400 && status < 500 && status !== 429)
        return false;
      if (current.state.error) return 5000;
      return !current.state.data || isProcessing(current.state.data.status)
        ? 2000
        : false;
    },
  });
  const batch = query.data;
  const errorStatus = importErrorStatus(query.error);
  const unavailable =
    query.isError && [401, 403, 404].includes(errorStatus ?? 0);

  useEffect(() => {
    if (!batch || query.isError) return;
    if (!preview && hasPreview(batch.status))
      router.replace(`${IMPORT_PATH}/${id}/preview`);
    if (preview && !hasPreview(batch.status))
      router.replace(`${IMPORT_PATH}/${id}`);
  }, [batch, id, preview, query.isError, router]);

  if (!validId)
    return (
      <Result
        status="404"
        title="Identificador de importação inválido"
        extra={<Link href={IMPORT_PATH}>Nova importação</Link>}
      />
    );
  if (query.isPending) return <FullPageLoading />;
  if (unavailable || !batch)
    return (
      <Result
        status={
          errorStatus === 403 ? "403" : errorStatus === 404 ? "404" : "warning"
        }
        title={importErrorMessage(query.error)}
        extra={
          errorStatus === 401 ? (
            <Link href="/login">Entrar novamente</Link>
          ) : (
            <Flex gap={16} justify="center" wrap>
              <Button
                onClick={() => query.refetch()}
                loading={query.isFetching}
              >
                Tentar novamente
              </Button>
              <Link href={IMPORT_PATH}>Nova importação</Link>
            </Flex>
          )
        }
      />
    );

  const processing = isProcessing(batch.status);
  const ready = hasPreview(batch.status);

  return (
    <PageLayout
      title={preview ? "Resumo da importação" : "Acompanhar importação"}
      backHref={IMPORT_PATH}
      actions={[
        <Link key="new" href={IMPORT_PATH}>
          <Button>Nova importação</Button>
        </Link>,
      ]}
    >
      <Flex vertical gap={24}>
        {query.isError && (
          <Alert
            type="warning"
            showIcon
            message={importErrorMessage(query.error)}
            description="Os dados abaixo são da última atualização recebida."
            action={
              <Button
                loading={query.isFetching}
                onClick={() => query.refetch()}
              >
                Atualizar
              </Button>
            }
          />
        )}
        <Card>
          <Flex vertical gap={12}>
            <Typography.Title
              level={4}
              style={{ margin: 0, overflowWrap: "anywhere" }}
            >
              {batch.sourceFileName}
            </Typography.Title>
            <div>
              <Tag
                color={
                  batch.status === "FAILED"
                    ? "error"
                    : ready
                      ? "success"
                      : "processing"
                }
              >
                {statusLabels[batch.status]}
              </Tag>
            </div>
            <Typography.Text type="secondary" copyable={{ text: id }}>
              Identificador: {id}
            </Typography.Text>
            {processing && (
              <div role="status" aria-live="polite">
                <Progress
                  percent={Math.max(0, Math.min(100, batch.progress))}
                  status="active"
                />
                <Typography.Paragraph>
                  {batch.statusMessage || statusLabels[batch.status]}
                </Typography.Paragraph>
                <Typography.Text type="secondary">
                  Você pode reabrir este endereço para acompanhar a importação.
                  Os totais ficam disponíveis ao finalizar a análise.
                </Typography.Text>
              </div>
            )}
            {batch.expiresAt && (
              <Typography.Text type="secondary">
                Prazo do rascunho:{" "}
                {new Date(batch.expiresAt).toLocaleString("pt-BR")}
              </Typography.Text>
            )}
          </Flex>
        </Card>
        <ImportSummary summary={batch.summary} />
        {batch.globalErrors.map((problem, index) => (
          <Alert
            key={`${problem.code}-${index}`}
            showIcon
            type={problem.severity === "ERROR" ? "error" : "warning"}
            message={problem.message}
            description={problem.suggestedFix}
          />
        ))}
        {batch.status === "FAILED" && (
          <Alert
            showIcon
            type="error"
            message="Não foi possível processar este documento."
            description="Consulte os motivos acima e selecione o arquivo novamente para fazer outra tentativa."
          />
        )}
        {batch.status === "FAILED" && batch.canRetry && (
          <ImportUpload key={id} retryId={id} />
        )}
        {batch.status === "EXPIRED" && (
          <Alert
            showIcon
            type="info"
            message="Este rascunho expirou ou foi descartado."
            description="Para continuar, inicie uma nova importação com o documento. Questões já salvas foram preservadas."
          />
        )}
        {ready && (
          <Alert
            showIcon
            type={batch.summary.invalidItems ? "warning" : "success"}
            message={
              batch.summary.totalItems
                ? "Questões identificadas e disponíveis no rascunho."
                : "Nenhuma questão foi identificada neste documento."
            }
            description={
              batch.summary.totalItems
                ? "A análise automática não substitui a revisão. O preview completo, a edição e a aprovação serão disponibilizados na próxima etapa desta funcionalidade."
                : "Confira o modelo de importação e envie o documento corrigido em uma nova importação."
            }
          />
        )}
        {batch.summary.warningItems > 0 && (
          <Typography.Paragraph type="secondary">
            Questões com aviso também podem estar incluídas entre as válidas ou
            entre as questões com erro.
          </Typography.Paragraph>
        )}
      </Flex>
    </PageLayout>
  );
}
