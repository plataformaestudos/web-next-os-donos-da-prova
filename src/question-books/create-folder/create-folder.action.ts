"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { CACHE_TAGS } from "@/util/cache-tags.util";
import HttpClient from "@/util/http-client/fetch-server.util";
import { ModuleModel } from "@/model/module.model";
import { ResponseModel } from "@/model/common.model";

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

  revalidateTag(CACHE_TAGS.QUESTION_BOOKS);
  revalidatePath(`/question-books`);

  return { success: true, error: null };
}
