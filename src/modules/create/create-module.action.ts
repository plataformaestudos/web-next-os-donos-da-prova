"use server";

import { CreateModuleDTO } from "../module.dto";
import HttpClient from "@/util/http-client/fetch-server.util";
import { ModuleModel } from "@/model/module.model";
import { ResponseModel } from "@/model/common.model";
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
        parentModuleId,
      }),
    }
  );

  if (error) {
    return { success: true, error };
  }

  if (parentModuleId) {
    revalidatePath(`/modules/${parentModuleId}`);
  }

  revalidatePath(`/modules/${data.id}`);

  return { success: true, error: null };
}
