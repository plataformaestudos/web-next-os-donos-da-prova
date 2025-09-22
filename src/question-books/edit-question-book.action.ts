"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { CACHE_TAGS } from "@/util/cache-tags.util";
import HttpClient from "@/util/http-client/fetch-server.util";
import { ResponseModel } from "@/model/common.model";
import { QuestionBookBookFolderModel } from "./book-folder.model";

export async function editQuestionBook({
  id,
  name,
}: {
  id: string;
  name: string;
}): Promise<{
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
        const res = await HttpClient.fetch<ResponseModel<QuestionBookBookFolderModel>>(`/question-books/${id}`, {
            method: "PUT",
            body: JSON.stringify({
                name,
            }),
        });
        if (res.error) {
            return { success: false, error: res.error };
        }
        const data = res.data;

        revalidateTag(CACHE_TAGS.QUESTION_BOOKS);
        revalidatePath(`/question-books`);
        revalidatePath(`/question-books/${data.id}`);

        return { success: true, error: null };

    } catch (error: unknown) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Erro ao editar caderno de questões"
        };
    }


}
