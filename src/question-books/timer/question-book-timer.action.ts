"use server";

import HttpClient from "@/util/http-client/fetch-server.util";
import { ResponseModel } from "@/model/common.model";

export interface QuestionBookTimerData {
    questionBookId: string;
    elapsedTimeMs: number;
    lastUpdated: string;
}

export async function getQuestionBookTimer(questionBookId: string): Promise<{
    success: boolean;
    data: QuestionBookTimerData | null;
    error: string | null;
}> {
    try {
        const res = await HttpClient.fetch<ResponseModel<QuestionBookTimerData>>(
            `/question-books/${questionBookId}/timer`,
            {
                method: "GET",
            }
        );

        if (res.statusCode >= 400 || res.error) {
            return { success: false, data: null, error: res.error ?? "Erro ao buscar timer" };
        }

        return { success: true, data: res.data ?? null, error: null };
    } catch (err: unknown) {
        return { 
            success: false, 
            data: null, 
            error: err instanceof Error ? err?.message ?? "Erro ao buscar timer" : "Erro ao buscar timer" 
        };
    }
}

export async function saveQuestionBookTimer(questionBookId: string, elapsedTimeMs: number): Promise<{
    success: boolean;
    error: string | null;
}> {
    try {
        const res = await HttpClient.fetch<ResponseModel<void>>(
            `/question-books/${questionBookId}/timer`,
            {
                method: "POST",
                body: JSON.stringify({
                    elapsedTimeMs                }),
            }
        );

        if (res.statusCode >= 400 || res.error) {
            return { success: false, error: res.error ?? "Erro ao salvar timer" };
        }

        return { success: true, error: null };
    } catch (err: unknown) {
        return { 
            success: false, 
            error: err instanceof Error ? err?.message ?? "Erro ao salvar timer" : "Erro ao salvar timer" 
        };
    }
}