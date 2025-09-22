"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { CACHE_TAGS } from "@/util/cache-tags.util";
import HttpClient from "@/util/http-client/fetch-server.util";
import { ResponseModel } from "@/model/common.model";



export async function favoriteQuestionBook(
    { questionBookId }: { questionBookId: string; }
): Promise<{
    success: boolean | null;
    error: string | null;
}> {

    try {
        const res = await HttpClient.fetch<ResponseModel<{ id: string }>>(
            "/question-books/favorite",
            {
                method: "POST",
                body: JSON.stringify({
                    questionBookId,
                }),
            }
        );
        if (res.error) {
            return { success: false, error: "err" };
        }
        const data = res.data;
        revalidateTag(CACHE_TAGS.QUESTION_BOOKS);
        revalidatePath(`/question-books/${data.id}`);

        return { success: true, error: null };

    } catch (error: unknown) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Erro ao criar prova"
        };
    }
}
