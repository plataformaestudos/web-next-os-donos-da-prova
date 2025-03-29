"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { CACHE_TAGS } from "@/util/cache-tags.util";
import { createClient } from "@/util/supabase/server";
import { redirect } from "next/navigation";

export async function deleteQuestion(id: string) {
  const supabase = await createClient();
  try {
    await supabase.from("questions").delete().match({ id });

    revalidateTag(CACHE_TAGS.QUESTIONS);
    revalidatePath("/questions");
    redirect(`/questions`);
  } catch {
    return false;
  }
}
