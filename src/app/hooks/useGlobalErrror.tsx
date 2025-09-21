"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { MessageInstance } from "antd/es/message/interface";

interface GlobalHttpErrorOptions {
  autoBack?: boolean;
  backDelay?: number;
  messageApi?: MessageInstance; 
}

export function useGlobalHttpError({ autoBack = true, backDelay = 900, messageApi }: GlobalHttpErrorOptions = {}) {
    const router = useRouter();
    const initialized = useRef(false);

    const recent = useRef(new Map<string | number, number>());

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        const CLEANUP_INTERVAL = 5000;
        const handler = (ev: Event) => {
            const custom = ev as CustomEvent<{ id?: number | string; status?: number; message?: string; body?: unknown, autoBack?: boolean }>;
            const id = custom?.detail?.id;
            const message = custom?.detail?.message ?? "Ocorreu um erro.";
            const key = id ?? `${custom?.detail?.status ?? "?"}:${message}`;

            const now = Date.now();
            const last = recent.current.get(key);
            if (last && now - last < 4000) return;
            recent.current.set(key, now);
            
            if (messageApi?.error) {
                messageApi.error(message);
            } else {
                // fallback
                // eslint-disable-next-line no-alert
                alert(message);
            }
            const autoBackForThisError = custom?.detail?.autoBack ?? autoBack;
            if (autoBackForThisError) {
                setTimeout(() => {
                    if (typeof window !== "undefined" && window.history.length > 1) {
                        router.back();
                    } else {
                        router.push("/");
                    }
                }, backDelay);
            }
        };

        window.addEventListener("globalHttpError", handler as EventListener);

        const cleanup = setInterval(() => {
            const cutoff = Date.now() - CLEANUP_INTERVAL;
            for (const [k, t] of recent.current) {
                if (t < cutoff) recent.current.delete(k);
            }
        }, CLEANUP_INTERVAL);

        return () => {
            window.removeEventListener("globalHttpError", handler as EventListener);
            clearInterval(cleanup);
        };
    }, [messageApi, router, autoBack, backDelay]);
}
