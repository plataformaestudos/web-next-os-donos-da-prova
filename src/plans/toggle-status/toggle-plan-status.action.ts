"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/util/cache-tags.util";
import { createClient } from "@/util/supabase/server";
import { redirect } from "next/navigation";

export async function togglePlanStatus(id: string, currentStatus: string) {
  const supabase = await createClient();
  
  try {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    
    await supabase
      .from("subscription_plans")
      .update({ status: newStatus })
      .match({ id });

    revalidateTag(CACHE_TAGS.PLANS);
    revalidatePath("/plans");
    redirect(`/plans`);
  } catch {
    return false;
  }
}
