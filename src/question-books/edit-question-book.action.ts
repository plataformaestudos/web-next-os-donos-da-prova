"use server";

import { createClient } from "@/util/supabase/server";
import { revalidatePath } from "next/cache";

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

  revalidatePath(`/question-books`);
  revalidatePath(`/question-books/${data.id}`);

  return { success: true, error: null };
}
