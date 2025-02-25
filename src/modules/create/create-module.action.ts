"use server";

import { CreateModuleDTO } from "../module.dto";
import HttpClient from "@/util/http-client/fetch-server.util";
import { ModuleModel } from "@/model/module.model";
import { ResponseModel } from "@/model/common.model";
import { createClient } from "@/util/supabase/server";
import { revalidatePath } from "next/cache";

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
        parentModuleId: parentModuleId
          ? parentModuleId.split("|").pop()
          : undefined,
      }),
    }
  );

  if (error) {
    return { success: true, error };
  }

  if (parentModuleId) {
    revalidatePath(`/modules/${parentModuleId.split("|").pop()}`);
  }

  revalidatePath(`/modules/${data.id}`);

  return { success: true, error: null };
}

export async function assignModuleToParent({
  parentModuleId,
  moduleId,
}: {
  parentModuleId: string;
  moduleId: string;
}): Promise<{
  success: boolean | null;
  error: string | null;
}> {
  const supabase = await createClient();

  await supabase.from("modules_submodules").insert({
    module_id: moduleId.split("|").pop(),
    parent_module_id: parentModuleId.split("|").pop(),
  });

  revalidatePath(`/modules/${parentModuleId.split("|").pop()}`);

  return { success: true, error: null };
}
