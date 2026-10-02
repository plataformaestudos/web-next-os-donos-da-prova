"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/util/cache-tags.util";
import HttpClient from "@/util/http-client/fetch-server.util";
import { redirect } from "next/navigation";

export async function togglePlanStatus(id: string, currentStatus: string) {
  try {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    
    await HttpClient.fetch(`/management/plans/${encodeURIComponent(id)}/status`, {
      method: "PATCH", body: JSON.stringify({ status: newStatus }),
    });
  } catch {
    return false;
  }
  revalidateTag(CACHE_TAGS.PLANS);
  revalidatePath("/plans");
  redirect("/plans");
}
