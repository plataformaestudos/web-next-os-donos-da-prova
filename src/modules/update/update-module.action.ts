"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { CACHE_TAGS } from "@/util/cache-tags.util";
import HttpClient from "@/util/http-client/fetch-server.util";
import { ResponseModel } from "@/model/common.model";
import { ModuleModel } from "@/model/module.model";

export async function updateModule(
    _: {success: boolean, error: string | null },
    { id, name, parentModuleId }: { id: string; name: string; parentModuleId?: string | null }
): Promise<{ success: boolean; error: string | null }> {
    if (!name) {
        return { success: false, error: "O nome do módulo não pode ser vazio" };
    }

    try {
        const res = await HttpClient.fetch<ResponseModel<ModuleModel>>(`/modules/${id}`, {
            method: "PUT",
            body: JSON.stringify({
                name,
                parentModuleId: parentModuleId || null,
            }),
        });

        const data = res.data;

        if (!data) {
            return { success: false, error: "Módulo não encontrado" };
        }

        if (res.error) {
            return { success: false, error: res.error };
        }

        revalidateTag(CACHE_TAGS.MODULES);
        revalidateTag(CACHE_TAGS.CHILD_MODULES);
        revalidateTag(CACHE_TAGS.ROOT_MODULES);
        revalidatePath("/modules");
        revalidatePath(`/modules/${id}`);

        return { success: true, error: null };
    } catch (error: unknown) {
        return { success: false, error: error instanceof Error ?  error?.message ?? "Erro ao atualizar módulo" : "Erro ao atualizar módulo"};
    }
}
