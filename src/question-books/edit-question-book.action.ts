"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { CACHE_TAGS } from "@/util/cache-tags.util";
import { createClient } from "@/util/supabase/server";

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

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("question_books")
    .update({
      name,
    })
    .match({ id })
    .select()
    .single();

  if (error) {
    return { success: true, error: error.message };
  }

  revalidateTag(CACHE_TAGS.QUESTION_BOOKS);
  revalidatePath(`/question-books`);
  revalidatePath(`/question-books/${data.id}`);

  return { success: true, error: null };
}
