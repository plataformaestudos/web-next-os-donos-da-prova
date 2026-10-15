"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Flex, Progress, Typography, theme } from "antd";
import { useUser } from "@/app/context/user.context";
import { canAccess, Roles } from "@/util/roles";
import HttpClient from "@/util/http-client/fetch-client.util";
import { ResponseModel } from "@/model/common.model";
import { usagePercentage } from "@/ui/home/free-plan-usage.model";
import { QuestionBookNextQuestionModel, QuestionDailyUsage } from "./question-book.model";

export function DailyQuestionUsage({ question, mobile }: { question: QuestionBookNextQuestionModel; mobile: boolean }) {
    const { user } = useUser();
    const { token } = theme.useToken();
    const enabled = canAccess(user, [Roles.STUDENT]);
    const confirmed = useRef<QuestionDailyUsage | null>(question.dailyUsage ?? null);
    const latestQuestion = useRef(question);
    latestQuestion.current = question;
    const lastCheckedAt = useRef(Date.now());
    const request = useRef<AbortController | null>(null);
    const [result, setResult] = useState({ source: question, value: question.dailyUsage ?? null, error: false });
    const usage = result.source === question ? result.value : question.dailyUsage === undefined ? confirmed.current : question.dailyUsage;
    const error = result.source === question ? result.error : question.dailyUsage === undefined && usage !== null;

    useEffect(() => {
        if (question.dailyUsage !== undefined) confirmed.current = question.dailyUsage;
        lastCheckedAt.current = Date.now();
        return () => {
            request.current?.abort();
            request.current = null;
        };
    }, [question]);

    const refresh = useCallback(async () => {
        // Only an authoritative Free snapshot enables this exceptional refresh.
        if (!enabled || !usage?.hasDailyQuestionLimit || request.current) return;
        const controller = new AbortController();
        request.current = controller;
        lastCheckedAt.current = Date.now();
        try {
            const response = await HttpClient.fetch<ResponseModel<QuestionDailyUsage | null>>(
                "/question-books/user/daily-usage",
                { method: "GET", cache: "no-store", signal: controller.signal }, false,
            );
            if (controller.signal.aborted || latestQuestion.current !== question) return;
            confirmed.current = response.data;
            setResult({ source: question, value: response.data, error: false });
        } catch {
            if (!controller.signal.aborted && latestQuestion.current === question) setResult({ source: question, value: usage, error: true });
        } finally {
            if (request.current === controller) request.current = null;
        }
    }, [enabled, usage, question]);

    useEffect(() => {
        if (!enabled || !usage) return;
        const refreshIfStale = () => {
            if (document.visibilityState === "visible" && Date.now() - lastCheckedAt.current >= 60_000) void refresh();
        };
        window.addEventListener("focus", refreshIfStale);
        window.addEventListener("pageshow", refreshIfStale);
        document.addEventListener("visibilitychange", refreshIfStale);
        return () => {
            window.removeEventListener("focus", refreshIfStale);
            window.removeEventListener("pageshow", refreshIfStale);
            document.removeEventListener("visibilitychange", refreshIfStale);
        };
    }, [enabled, usage, refresh]);

    useEffect(() => {
        if (!enabled || !usage || error) return;
        const reset = Date.parse(usage.dailyResetAt);
        if (!Number.isFinite(reset)) return;
        const timer = window.setTimeout(() => { void refresh(); }, Math.max(1000, reset - Date.now() + 100));
        return () => window.clearTimeout(timer);
    }, [enabled, usage, error, refresh]);

    if (!enabled || !usage?.hasDailyQuestionLimit) return null;
    const { dailyQuestionLimit, questionsViewedToday } = usage;
    const reached = questionsViewedToday >= dailyQuestionLimit;
    return (
        <div style={{ width: mobile ? "100%" : 260, maxWidth: "100%", marginBottom: mobile ? 12 : 16 }} role="region" aria-label="Limite diário de questões">
            <Flex justify="space-between" gap={8}>
                <Typography.Text style={{ fontSize: 12 }}>Questões visualizadas hoje</Typography.Text>
                <Typography.Text strong style={{ fontSize: 12, color: reached ? token.colorErrorText : token.colorText }}>{questionsViewedToday}/{dailyQuestionLimit}</Typography.Text>
            </Flex>
            <Progress percent={usagePercentage(questionsViewedToday, dailyQuestionLimit)} showInfo={false} size={{ height: 4 }} strokeColor={reached ? token.colorError : token.colorPrimary} trailColor={token.colorFillSecondary} style={{ display: "block", lineHeight: 1, margin: "4px 0 0" }} aria-label="Questões visualizadas hoje" aria-valuetext={`${questionsViewedToday} de ${dailyQuestionLimit} questões visualizadas hoje`} />
            {reached && <Flex justify="space-between" gap={8} wrap style={{ marginTop: 4 }}><Typography.Text type="danger" style={{ fontSize: 12 }}>Limite de hoje atingido</Typography.Text><Typography.Link href="/subscription" style={{ fontSize: 12 }}>Ver planos</Typography.Link></Flex>}
            {error && <Flex align="center" gap={4} role="status"><Typography.Text type="secondary" style={{ fontSize: 12 }}>Não foi possível atualizar o consumo.</Typography.Text><Button type="link" size="small" onClick={() => { void refresh(); }}>Tentar novamente</Button></Flex>}
        </div>
    );
}
