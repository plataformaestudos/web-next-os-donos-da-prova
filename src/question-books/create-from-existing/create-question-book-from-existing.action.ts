"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/util/cache-tags.util";
import HttpClient from "@/util/http-client/fetch-server.util";
import { ResponseModel } from "@/model/common.model";
import { QuestionBookCreationType } from "../types/question-book-creation-type.types";

export async function createQuestionBookFromExisting({
    questionBookId,
    name,
    type,
}: {
    questionBookId: string;
    name: string;
    type: QuestionBookCreationType;
}): Promise<{
    success: boolean | null;
    error: string | null;
    data?: { id: string } | null;
}> {
    if (!name) {
        return {
            success: false,
            error: "O nome do caderno não pode ser vazio",
        };
    }

    if (!questionBookId) {
        return {
            success: false,
            error: "O ID do caderno original é obrigatório",
        };
    }

    try {
        const res = await HttpClient.fetch<ResponseModel<{ id: string }>>(
            "/question-books/create-from-existing",
            {
                method: "POST",
                body: JSON.stringify({
                    questionBookId,
                    name,
                    type,
                }),
            }
        );

        if (res.error) {
            return { success: false, error: res.error, data: null };
        }

        const data = res.data;

        revalidateTag(CACHE_TAGS.QUESTION_BOOKS);
        revalidatePath(`/question-books`);
        if (data?.id) {
            revalidatePath(`/question-books/${data.id}`);
        }

        return { success: true, error: null, data: data ?? null };

    } catch (error: unknown) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Erro ao criar caderno a partir do existente",
            data: null,
        };
    }
}


