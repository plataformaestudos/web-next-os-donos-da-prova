"use server";

import { createClient } from "@/util/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function deleteModule(id: string) {
  const supabase = await createClient();
  try {
    await supabase.from("modules").delete().match({ id });

    revalidatePath("/modules");
    redirect("/modules");
  } catch {
    return false;
  }
}
