"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { CACHE_TAGS } from "@/util/cache-tags.util";
import { createClient } from "@/util/supabase/server";

export async function deleteModule(id: string) {
  const supabase = await createClient();
  try {
    await supabase.from("modules").delete().match({ id });

    revalidateTag(CACHE_TAGS.MODULES);
    revalidatePath("/modules");
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
    revalidatePath("/modules");
  } catch {
    return false;
  }
}
