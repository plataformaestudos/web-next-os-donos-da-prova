"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { CACHE_TAGS } from "@/util/cache-tags.util";
import { createClient } from "@/util/supabase/server";
import HttpClient from "@/util/http-client/fetch-server.util";
import { ResponseModel } from "@/model/common.model";

export async function deleteModule(id: string): Promise<{ success: boolean; error: string | null }> {
    try {
        const res = await HttpClient.fetch<ResponseModel<null>>(`/modules/${id}`, {
            method: "DELETE",
        });

        if (res.error) {
            return { success: false, error: res.error };
        }

        revalidateTag(CACHE_TAGS.MODULES);
        revalidateTag(CACHE_TAGS.CHILD_MODULES);
        revalidateTag(CACHE_TAGS.ROOT_MODULES);
        revalidatePath("/modules");

        return { success: true, error: null };
    } catch (error: unknown) {
        return { success: false, error: error instanceof Error ?  error?.message ?? "Erro ao deletar módulo" : "Erro ao deletar módulo"};
    }
}

export async function unlinkModule(id: string, parentModuleId: string) {
    const supabase = await createClient();
    try {
        await supabase.from("modules_submodules").delete().match({
            module_id: id,
            parent_module_id: parentModuleId,
        });

        revalidateTag(CACHE_TAGS.MODULES);
        revalidateTag(CACHE_TAGS.CHILD_MODULES);
        revalidateTag(CACHE_TAGS.ROOT_MODULES);
        revalidatePath("/modules");
    } catch {
        return false;
    }
}
