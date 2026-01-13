"use client";

import { useEffect, useRef } from "react";
import { App, Result } from "antd";
import { useRouter } from "next/navigation";
import styled, { DefaultTheme, useTheme } from "styled-components";
import { extractErrorMessage } from "@/lib/error-utils";

type ErrorData = { error?: string; message?: string } | Record<string, unknown>;

type AppError = Error & {
    data?: ErrorData;
    cause?: Error | string | { message?: string; error?: string } | unknown;
    digest?: string;
    errorCode?: string;
    status?: number;
};

export default function GlobalAppError({
    error,
}: {
    error: AppError;
}) {
    const app = App.useApp?.();
    const router = useRouter();
    const theme = useTheme();
    const notifiedRef = useRef(false);

    useEffect(() => {
        if (!notifiedRef.current) {
            const friendly = extractErrorMessage(error);

            if (app?.message) {
                app.message.error(friendly);
            } else {
                alert(friendly);
            }

            // Log completo do erro para debug em produção
            console.error("Erro capturado:", {
                message: error.message,
                errorCode: error.errorCode,
                status: error.status,
                data: error.data,
                cause: error.cause,
                digest: error.digest,
                stack: error.stack,
                extractedMessage: friendly
            });

            notifiedRef.current = true;
        }

        const timer = setTimeout(() => {
            if (typeof window !== "undefined" && window.history.length > 1) {
                router.back();
            } else {
                router.push("/");
            }
        }, 1200);

        return () => clearTimeout(timer);
    }, [error, app, router]);

    return (
        <Wrapper $theme={theme}>
            <Result
                status="error"
                title="Ops — algo deu errado"
                subTitle={extractErrorMessage(error)}
            />
        </Wrapper>
    );
}

const Wrapper = styled.div<{ $theme: DefaultTheme }>`
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background:${({ theme }) => theme.colorPrimaryBg};
  color: ${({ theme }) => theme.colorText};
`;
