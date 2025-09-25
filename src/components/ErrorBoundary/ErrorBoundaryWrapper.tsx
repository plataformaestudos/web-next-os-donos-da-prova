"use client";

import React from "react";
import { App } from "antd";
import { ErrorBoundary } from "./ErrorBoundary";
import { useGlobalHttpError } from "@/app/hooks/useGlobalErrror";


type NotifiableError = Error & {
    _notified?: boolean;
    _globalErrorId?: string;
    data?: { error?: string };
};


export function ErrorBoundaryWrapper({ children }: { children: React.ReactNode }) {
    const app = App.useApp?.();
    const messageApi = app?.message;
    useGlobalHttpError({ autoBack: true, backDelay: 900, messageApi });

    const handleError = (error: Error) => {
        try {
            const err = error as NotifiableError;

            if (err._notified) {
                console.debug("Erro já notificado — ignorando duplicate:", err._globalErrorId ?? err.message);
                return;
            }
            const isNextProdError = err.message?.startsWith("An error occurred in the Server Components render");
            console.log("Handling error in ErrorBoundaryWrapper:", err, "isNextProdError:", isNextProdError);
            const friendly =
                err.data?.error ||
                (isNextProdError ? "Ops, algo deu errado ao carregar os dados." : err.message) ||
                "Ocorreu um erro inesperado.";
            console.log("Friendly error message:", friendly);

            if (messageApi && typeof messageApi.error === "function") {
                messageApi.error(friendly);
            } else {
                console.error("Notification fallback:", friendly);
            }

            err._notified = true;
        } catch (e) {
            console.error("Falha ao mostrar mensagem de erro", e);
        }
    };

    return <ErrorBoundary onError={handleError}>{children}</ErrorBoundary>;
}
