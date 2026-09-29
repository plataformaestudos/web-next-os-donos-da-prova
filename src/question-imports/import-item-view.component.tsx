"use client";

import { Alert, Divider, Flex, Tag, Typography } from "antd";
import Link from "next/link";
import type { ImportItem } from "./import-preview.model";
import {
  moduleLabels,
  reviewLabels,
  validityLabels,
} from "./import-preview.rules";
import { ImportContent } from "./import-content.component";

export function ItemLabels({ item }: { item: ImportItem }) {
  return (
    <Flex gap={4} wrap>
      <Tag color={item.validationStatus === "INVALID" ? "error" : "success"}>
        {validityLabels[item.validationStatus]}
      </Tag>
      <Tag color={item.reviewStatus === "APPROVED" ? "blue" : "default"}>
        {reviewLabels[item.reviewStatus]}
      </Tag>
      {item.persistenceStatus === "SAVED" && <Tag color="green">Salva</Tag>}
      {item.persistenceStatus === "SAVING" && <Tag>Em salvamento</Tag>}
    </Flex>
  );
}

export function ImportItemView({
  item,
  imageUrls,
}: {
  item: ImportItem;
  imageUrls: Record<string, string>;
}) {
  return (
    <Flex vertical gap={12}>
      <ItemLabels item={item} />
      <Typography.Text type="secondary">
        Número no DOCX: {item.sourceNumber ?? "não identificado"} ·{" "}
        {item.payload.type === "RIGHT_OR_WRONG"
          ? "Certo ou errado"
          : item.payload.type === "MULTIPLE_CHOICE"
            ? "Múltipla escolha"
            : "Tipo não identificado"}{" "}
        · Dificuldade: {item.payload.difficultyLevel}
      </Typography.Text>
      <Typography.Text>
        {item.modulePath.join(" › ") || "Módulo não identificado"} —{" "}
        {moduleLabels[item.moduleResolutionStatus]}
      </Typography.Text>
      <ImportContent html={item.payload.text} imageUrls={imageUrls} />
      {item.payload.alternatives.map((alternative, index) => (
        <Flex key={index} gap={12} align="start">
          <Tag
            color={
              item.payload.answer === String.fromCharCode(65 + index)
                ? "green"
                : undefined
            }
          >
            {String.fromCharCode(65 + index)}
          </Tag>
          <ImportContent html={alternative.text} imageUrls={imageUrls} />
        </Flex>
      ))}
      <Typography.Text strong>
        Resposta: {item.payload.answer || "não identificada"}
      </Typography.Text>
      <Divider style={{ margin: "4px 0" }} />
      <Typography.Text strong>Comentário</Typography.Text>
      <ImportContent html={item.payload.comment} imageUrls={imageUrls} />
      {item.issues.map((issue, index) => (
        <Alert
          key={`${issue.code}-${index}`}
          showIcon
          type={issue.severity === "ERROR" ? "error" : "warning"}
          message={issue.message}
          description={issue.suggestedFix}
        />
      ))}
      {item.saveError && (
        <Alert
          showIcon
          type="error"
          message={`Falha ao salvar: ${item.saveError.message}`}
          description={item.saveError.suggestedFix}
        />
      )}
      {item.savedQuestionId && (
        <Link href={`/questions/view/${item.savedQuestionId}`} target="_blank">
          Abrir questão salva
        </Link>
      )}
    </Flex>
  );
}
