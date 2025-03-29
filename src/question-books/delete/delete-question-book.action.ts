"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { CACHE_TAGS } from "@/util/cache-tags.util";
import { createClient } from "@/util/supabase/server";
import { redirect } from "next/navigation";

export async function deleteQuestionBook(id: string) {
  const supabase = await createClient();
  try {
    await supabase.from("question_books").delete().match({ id });

    revalidateTag(CACHE_TAGS.QUESTION_BOOKS);
    revalidatePath("/question-books");
    redirect(`/question-books`);
  } catch {
    return false;
  }
}
