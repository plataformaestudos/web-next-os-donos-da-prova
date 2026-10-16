"use client";

import { Button, Result, Space } from "antd";
import { useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { StudyAccess } from "./study-access.model";
import { useStudyAccess } from "./study-access-provider.component";

export function StudyAccessBlocked({ access }: { access: StudyAccess }) {
    const { showBlocked } = useStudyAccess();
    const router = useRouter();
    const [pending, startTransition] = useTransition();
    const retryRequested = useRef(false);
    useEffect(() => {
        showBlocked(access, { automatic: !retryRequested.current });
        retryRequested.current = false;
    }, [access, showBlocked]);

    return <Result
        status="info"
        title={access.reason === "FREE_DAILY_LIMIT_REACHED" ? "Você atingiu o limite de questões de hoje" : "Seu período gratuito terminou"}
        subTitle="Conheça os planos para continuar estudando."
        extra={<Space wrap>
            <Button type="primary" onClick={() => router.push("/assinatura?tab=planos")}>Ver planos</Button>
            <Button loading={pending} onClick={() => {
                retryRequested.current = true;
                startTransition(() => router.refresh());
            }}>Tentar novamente</Button>
        </Space>}
    />;
}
