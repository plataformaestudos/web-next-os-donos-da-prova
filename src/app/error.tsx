"use client";

import { useEffect, useRef } from "react";
import { App, Result } from "antd";
import { useRouter } from "next/navigation";
import styled, { DefaultTheme, useTheme } from "styled-components";

type AppError = Error & {
    data?: { error?: string };
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
            const isNextProdError = error.message?.startsWith("An error occurred in the Server Components render");
            const friendly =
                error.data?.error ||
                (isNextProdError ? "Ops, algo deu errado ao carregar os dados." : error.message) ||
                "Ocorreu um erro inesperado.";

            if (app?.message) {
                app.message.error(friendly);
            } else {
                alert(friendly);
            }



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
                subTitle={
                    error.data?.error ??
                    error.message ??
                    "Estamos trabalhando para corrigir isso."
                }
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
