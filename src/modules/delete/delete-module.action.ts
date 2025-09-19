"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { CACHE_TAGS } from "@/util/cache-tags.util";
import { createClient } from "@/util/supabase/server";
import HttpClient from "@/util/http-client/fetch-server.util";
import { ResponseModel } from "@/model/common.model";

export async function deleteModule(id: string) {
    try {
        const { error } = await HttpClient.fetch<ResponseModel<null>>(
            `/modules/${id}`,
            {
                method: "DELETE",
            }
        );

        if (error) return false;

        revalidateTag(CACHE_TAGS.MODULES);
        revalidateTag(CACHE_TAGS.CHILD_MODULES);
        revalidateTag(CACHE_TAGS.ROOT_MODULES);
        revalidatePath("/modules");

        return true;
    } catch {
        return false;
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
