"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { CACHE_TAGS } from "@/util/cache-tags.util";
import { createClient } from "@/util/supabase/server";
import { redirect } from "next/navigation";

export async function deletePlan(id: string) {
  const supabase = await createClient();
  try {
    await supabase.from("subscription_plans").delete().match({ id });

    revalidateTag(CACHE_TAGS.PLANS);
    revalidatePath("/plans");
    redirect(`/plans`);
  } catch {
    return false;
  }
}
