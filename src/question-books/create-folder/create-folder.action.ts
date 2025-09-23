"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { CACHE_TAGS } from "@/util/cache-tags.util";
import HttpClient from "@/util/http-client/fetch-server.util";
import { ResponseModel } from "@/model/common.model";
import { BookFolderModel } from "../book-folder.model";

export async function createFolder({ name }: { name: string }): Promise<{
    success: boolean | null;
    error: string | null;
     data?: BookFolderModel | null;
}> {
    try {
        if (!name) {
            return {
                success: false,
                error: "O nome deve ser preenchido",
            };
        }

        const res = await HttpClient.fetch<ResponseModel<BookFolderModel>>(
            "/book-folders",
            {
                method: "POST",
                body: JSON.stringify({
                    name,
                }),
            }
        );
        if (res.error) {
            return { success: true, error: res.error, data: null };
        }
        const created = res.data ?? null;
        revalidateTag(CACHE_TAGS.QUESTION_BOOKS);
        revalidatePath(`/question-books`);

         return { success: true, error: null, data: created };
    } catch (error: unknown) {
        return { success: false, error: error instanceof Error ?  error?.message ?? "Erro ao criar pasta"  : "Erro ao criar pasta", data: null};
    }


}
