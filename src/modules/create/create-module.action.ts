"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { CACHE_TAGS } from "@/util/cache-tags.util";
import { CreateModuleDTO } from "../module.dto";
import HttpClient from "@/util/http-client/fetch-server.util";
import { ModuleModel } from "@/model/module.model";
import { ResponseModel } from "@/model/common.model";

export async function createModule({
    parentModuleId,
    name,
}: CreateModuleDTO): Promise<{
    success: boolean | null;
    error: string | null;
}> {
    if (!name) {
        return {
            success: false,
            error: "O nome deve ser preenchido",
        };
    }


    try {
        const res = await HttpClient.fetch<ResponseModel<ModuleModel>>("/modules", {
            method: "POST",
            body: JSON.stringify({
                name,
                parentModuleId,
            }),
        });
        const data = res.data;

        if (parentModuleId) {
            revalidatePath(`/modules/${parentModuleId}`);
        }

        revalidatePath(`/modules/${data.id}`);
        revalidateTag(CACHE_TAGS.MODULES);
        revalidateTag(CACHE_TAGS.CHILD_MODULES);
        revalidateTag(CACHE_TAGS.ROOT_MODULES);

        return { success: true, error: null };
    } catch (error: unknown) {
        return { success: false, error:  error instanceof Error ? error?.message ?? "Erro ao criar módulo" : "Erro ao criar módulo"};
    }
}
