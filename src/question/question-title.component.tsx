"use client";

import * as Styled from "./question-title.style";

import { App, Tooltip } from "antd";
import { LuClipboardCheck, LuClipboardCopy } from "react-icons/lu";
import { useEffect, useState } from "react";

export function QuestionTitle({ id }: { id: string }) {
  const { message } = App.useApp();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let timeoutRef: NodeJS.Timeout;
    if (copied) {
      timeoutRef = setTimeout(() => {
        setCopied(false);
      }, 3000);
    }

    return () => clearTimeout(timeoutRef);
  }, [copied]);

  return (
    <Styled.Container
      onClick={() => {
        navigator.clipboard
          .writeText(id)
          .then(() => {
            setCopied(true);
            message.success("Copiado com sucesso!");
          })
          .catch(() => {
            message.error("Não foi possível copiar");
          });
      }}
    >
      <Styled.TitleContainer>
        <h1>Questão</h1>
        <span>{id}</span>
      </Styled.TitleContainer>
      <Tooltip
        title="Copiar código da questão para a área de transferência"
        placement="top"
      >
        <span>
          {copied ? (
            <LuClipboardCheck size={20} />
          ) : (
            <LuClipboardCopy size={20} />
          )}
        </span>
      </Tooltip>
    </Styled.Container>
  );
}
