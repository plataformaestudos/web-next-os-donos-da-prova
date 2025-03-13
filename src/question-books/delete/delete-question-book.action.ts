"use server";

import { createClient } from "@/util/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function deleteQuestionBook(id: string) {
  const supabase = await createClient();
  try {
    await supabase.from("question_books").delete().match({ id });

    revalidatePath("/question-books");
    redirect(`/question-books`);
  } catch {
    return false;
  }
}
