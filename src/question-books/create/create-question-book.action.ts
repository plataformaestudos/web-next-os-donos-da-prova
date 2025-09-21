"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { CACHE_TAGS } from "@/util/cache-tags.util";
import HttpClient from "@/util/http-client/fetch-server.util";
import { QuestionBookDTO } from "./question-book.dto";
import { ResponseModel } from "@/model/common.model";
import { redirect } from "next/navigation";

export async function createQuestionBook(
    _: {
        success: boolean | null;
        error: string | null;
    },
    { name, folderId, modules }: Omit<QuestionBookDTO, "id">
): Promise<{
    success: boolean | null;
    error: string | null;
}> {

    try {
        if (!name) {
            return { success: false, error: "O nome do caderno não pode ser vazio" };
        }
        const res = await HttpClient.fetch<ResponseModel<{ id: string }>>(
            "/question-books",
            {
                method: "POST",
                body: JSON.stringify({
                    name,
                    folderId,
                    modules,
                }),
            }
        );
        if (res.error) {
            return { success: false, error: "err" };
        }
        const data = res.data;
        revalidateTag(CACHE_TAGS.QUESTION_BOOKS);
        revalidatePath(`/question-books/${data.id}`);
        redirect(`/question-books/${data.id}`);

    } catch (error: unknown) {
        if (!(error instanceof Error && (error as any)?.digest === "NEXT_REDIRECT")) {
             throw error;
        }
        return {
            success: false,
            error: error instanceof Error ? error.message : "Erro ao criar prova"
        };
    }
}
