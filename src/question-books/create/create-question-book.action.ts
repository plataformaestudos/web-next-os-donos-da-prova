"use server";

// import HttpClient from "@/util/http-client/fetch-server.util";
import { QuestionBookDTO } from "./question-book.dto";
// import { ResponseModel } from "@/model/common.model";
import { createClient } from "@/util/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createQuestionBook(
  _: {
    success: boolean | null;
    error: string | null;
  },
  {
    name,
    folderId,
  }: // modules
  Omit<QuestionBookDTO, "id">
): Promise<{
  success: boolean | null;
  error: string | null;
}> {
  const supabase = await createClient();
  const user_id = (await supabase.auth.getUser()).data.user?.id;

  const { data, error } = await supabase
    .from("question_books")
    .insert({
      name,
      folder_id: folderId,
      user_id,
    })
    .select()
    .single();

  // const { data, error } = await HttpClient.fetch<ResponseModel<{ id: string }>>(
  //   "/question-books",
  //   {
  //     method: "POST",
  //     body: JSON.stringify({
  //       name,
  //       folderId,
  //       modules,
  //     }),
  //   }
  // );

  if (error) {
    return { success: false, error: "Error" };
  }

  revalidatePath(`/question-books/${data.id}`);
  redirect(`/question-books/${data.id}`);
}
