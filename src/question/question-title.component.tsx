"use client";

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
    <div
      className="flex gap-2 items-center cursor-pointer"
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
      <div>
        <h1 className="text-xl font-bold leading-none">Questão</h1>
        <span className="text-xs text-gray-600">{id}</span>
      </div>
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
    </div>
  );
}
