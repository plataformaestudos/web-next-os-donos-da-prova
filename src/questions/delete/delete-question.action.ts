"use server";

import { createClient } from "@/util/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function deleteQuestion(id: string) {
  const supabase = await createClient();
  try {
    await supabase.from("questions").delete().match({ id });

    revalidatePath("/questions");
    redirect(`/questions`);
  } catch {
    return false;
  }
}
