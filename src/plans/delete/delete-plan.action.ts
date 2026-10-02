"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { CACHE_TAGS } from "@/util/cache-tags.util";
import HttpClient from "@/util/http-client/fetch-server.util";
import { redirect } from "next/navigation";

export async function deletePlan(id: string) {
  try {
    await HttpClient.fetch(`/management/plans/${encodeURIComponent(id)}`, { method: "DELETE" });
  } catch {
    return false;
  }
  revalidateTag(CACHE_TAGS.PLANS);
  revalidatePath("/plans");
  redirect("/plans");
}
