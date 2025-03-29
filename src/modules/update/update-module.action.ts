"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { CACHE_TAGS } from "@/util/cache-tags.util";
import { createClient } from "@/util/supabase/server";

export async function updateModule(
  _: {
    error: string | null;
  },
  { id, name }: { id: string; name: string }
): Promise<{ error: string | null }> {
  if (!name) {
    return {
      error: "O nome do módulo não pode ser vazio",
    };
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("modules")
    .update({
      name,
    })
    .match({ id })
    .select()
    .single();

  if (!data) {
    return {
      error: "Módulo não encontrado",
    };
  }

  revalidateTag(CACHE_TAGS.MODULES);
  revalidatePath("/modules");
  revalidatePath(`/modules/${id}`);

  return { error: null };
}
