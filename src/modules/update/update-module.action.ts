"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { CACHE_TAGS } from "@/util/cache-tags.util";
import HttpClient from "@/util/http-client/fetch-server.util";
import { ResponseModel } from "@/model/common.model";
import { ModuleModel } from "@/model/module.model";

export async function updateModule(
    _: {
        error: string | null;
    },
    { id, name, parentModuleId }: { id: string; name: string, parentModuleId?: string | null }
): Promise<{ error: string | null }> {
    if (!name) {
        return {
            error: "O nome do módulo não pode ser vazio",
        };
    }
    const { data, error } = await HttpClient.fetch<ResponseModel<ModuleModel>>(
        `/modules/${id}`,
        {
            method: "PUT",
            body: JSON.stringify({
                name,
                parentModuleId: parentModuleId || null,
            }),
        }
    );
    if (!data) {
        return {
            error: "Módulo não encontrado",
        };
    }

    if (error) {
        return { error };
    }

    revalidateTag(CACHE_TAGS.MODULES);
    revalidateTag(CACHE_TAGS.CHILD_MODULES);
    revalidateTag(CACHE_TAGS.ROOT_MODULES);
    revalidatePath("/modules");
    revalidatePath(`/modules/${id}`);

    return { error: null };
}
