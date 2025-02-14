"use server";

import { CreateModuleDTO } from "../module.dto";
import { createClient } from "@/util/supabase/server";
import { revalidatePath } from "next/cache";

export async function createModule({
  parent_module_id,
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

  const supabase = await createClient();

  if (parent_module_id) {
    const { data } = await supabase
      .from("modules")
      .select()
      .eq("id", parent_module_id);

    if (!data?.length) {
      return {
        success: false,
        error: "Módulo pai não encontrado",
      };
    }
  }

  const { data: createdModule } = await supabase
    .from("modules")
    .insert({
      name,
    })
    .select();

  if (createdModule) {
    const [{ id: module_id }] = createdModule;

    if (parent_module_id) {
      await supabase.from("modules_submodules").insert({
        module_id,
        parent_module_id,
      });

      revalidatePath(`/modules/${parent_module_id}`);
    }

    revalidatePath(`/modules/${module_id}`);
  }

  return { success: true, error: null };
}
