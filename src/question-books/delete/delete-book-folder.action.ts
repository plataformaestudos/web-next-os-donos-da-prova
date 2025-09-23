"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/util/cache-tags.util";
import HttpClient from "@/util/http-client/fetch-server.util";
import { ResponseModel } from "@/model/common.model";

export async function deleteBookFolder(id: string) {
    try {
        const res = await HttpClient.fetch<ResponseModel<null>>(`/book-folders/${id}`, {
            method: "DELETE",
        });

        if (res.error) {
            return { success: false, error: res.error };
        }

        revalidateTag(CACHE_TAGS.BOOK_FOLDERS);
        revalidatePath("/question-books");

        return { success: true, error: null };
    } catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error?.message ?? "Erro ao deletar caderno de questões" : "Erro ao deletar caderno de questões" };
    }
}

