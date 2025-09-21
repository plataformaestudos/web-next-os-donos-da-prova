"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { CACHE_TAGS } from "@/util/cache-tags.util";
import HttpClient from "@/util/http-client/fetch-server.util";
import { ModuleModel } from "@/model/module.model";
import { ResponseModel } from "@/model/common.model";

export async function createFolder({ name }: { name: string }): Promise<{
    success: boolean | null;
    error: string | null;
}> {
    try {
        if (!name) {
            return {
                success: false,
                error: "O nome deve ser preenchido",
            };
        }

        const res = await HttpClient.fetch<ResponseModel<ModuleModel>>(
            "/book-folders",
            {
                method: "POST",
                body: JSON.stringify({
                    name,
                }),
            }
        );
        if (res.error) {
            return { success: true, error: res.error };
        }
        revalidateTag(CACHE_TAGS.QUESTION_BOOKS);
        revalidatePath(`/question-books`);

        return { success: true, error: null };
    } catch (error: unknown) {
        return { success: false, error: error instanceof Error ?  error?.message ?? "Erro ao criar pasta"  : "Erro ao criar pasta"};
    }


}
