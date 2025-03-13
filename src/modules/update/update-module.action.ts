"use server";

import { createClient } from "@/util/supabase/server";
import { revalidatePath } from "next/cache";

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

  revalidatePath(`/modules`);
  revalidatePath(`/modules/${id}`);

  return { error: null };
}
