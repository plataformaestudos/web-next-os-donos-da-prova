"use server";

import HttpClient from "@/util/http-client/fetch-server.util";
import { ModuleModel } from "@/model/module.model";
import { ResponseModel } from "@/model/common.model";
import { revalidatePath } from "next/cache";

export async function createFolder({ name }: { name: string }): Promise<{
  success: boolean | null;
  error: string | null;
}> {
  if (!name) {
    return {
      success: false,
      error: "O nome deve ser preenchido",
    };
  }

  const { error } = await HttpClient.fetch<ResponseModel<ModuleModel>>(
    "/book-folders",
    {
      method: "POST",
      body: JSON.stringify({
        name,
      }),
    }
  );

  if (error) {
    return { success: true, error };
  }

  revalidatePath(`/question-books`);

  return { success: true, error: null };
}
