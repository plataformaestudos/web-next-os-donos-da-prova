"use server";

import { UpsertPlanDTO } from "./upsert-plan.dto";
import { createClient } from "@/util/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function upsertPlan(
  _: {
    error: string | null;
  },
  { id, name, price, modules }: UpsertPlanDTO
): Promise<{ error: string | null }> {
  if (!name || isNaN(parseFloat(price as unknown as string))) {
    return {
      error: "Nome e preço são obrigatórios",
    };
  }

  const supabase = await createClient();

  const { data: plan } = await supabase
    .from("subscription_plans")
    .upsert({
      id,
      name,
      price,
    })
    .select()
    .single();

  if (plan) {
    await supabase.from("plans_modules").delete().eq("plan_id", plan.id);
    await supabase.from("plans_modules").insert(
      modules.map((module) => ({
        plan_id: plan.id,
        module_id: module,
      }))
    );
  }

  revalidatePath("/plans");
  revalidatePath(`/plans/${plan.id}`);
  redirect(`/plans/${plan.id}`);
}
