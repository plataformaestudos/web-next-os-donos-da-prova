"use server";

import { createClient } from "@/util/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function deletePlan(id: string) {
  const supabase = await createClient();
  try {
    await supabase.from("subscription_plans").delete().match({ id });

    revalidatePath("/plans");
    redirect(`/plans`);
  } catch {
    return false;
  }
}
