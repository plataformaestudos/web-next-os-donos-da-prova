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

    const { data, error } = await HttpClient.fetch<ResponseModel<ModuleModel>>(
        "/modules",
        {
            method: "POST",
            body: JSON.stringify({
                name,
                parentModuleId,
            }),
        }
    );

    if (error) {
        return { success: false, error };
    }

    if (parentModuleId) {
        revalidatePath(`/modules/${parentModuleId}`);
    }

    revalidatePath(`/modules/${data.id}`);
    revalidateTag(CACHE_TAGS.MODULES);
    revalidateTag(CACHE_TAGS.CHILD_MODULES);
    revalidateTag(CACHE_TAGS.ROOT_MODULES);

    return { success: true, error: null };
}
