"use server";

import { createClient } from "@/util/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteModule(id: string) {
  const supabase = await createClient();
  try {
    await supabase
      .from("modules")
      .delete()
      .match({ id: id.split("|").pop() });

    revalidatePath(`/modules/${id}`);
  } catch {
    return false;
  }
}

export async function unlinkModule(id: string, parentModuleId: string) {
  const supabase = await createClient();
  try {
    await supabase
      .from("modules_submodules")
      .delete()
      .match({
        module_id: id.split("|").pop(),
        parent_module_id: parentModuleId.split("|").pop(),
      });

    revalidatePath(`/modules/${parentModuleId}`);
  } catch {
    return false;
  }
}
