"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { CACHE_TAGS } from "@/util/cache-tags.util";
import HttpClient from "@/util/http-client/fetch-server.util";
import { redirect } from "next/navigation";

export async function deleteQuestion(id: string) {
  try {
    await HttpClient.fetch(`/management/questions/${encodeURIComponent(id)}`, { method: "DELETE" });
  } catch {
    return false;
  }
  revalidateTag(CACHE_TAGS.QUESTIONS);
  revalidatePath("/questions");
  redirect("/questions");
}
