"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { CACHE_TAGS } from "@/util/cache-tags.util";
import { UpsertPlanDTO } from "./upsert-plan.dto";
import { createClient } from "@/util/supabase/server";
import { redirect } from "next/navigation";

export async function upsertPlan(
  _: {
    error: string | null;
  },
  { id, name, description, isFree, durationDays, lifetimeValue, monthValue, quarterlyValue, questionLimit, semiannualValue, yearlyValue, modules }: UpsertPlanDTO
): Promise<{ error: string | null }> {
  if (!name) {
    return {
      error: "Nome é obrigatório",
    };
  }

  const supabase = await createClient();

  const { data: plan, error } = await supabase
    .from("subscription_plans")
    .upsert({
      id,
      name,
      description,
      month_value: monthValue,
      quarterly_value: quarterlyValue,
      semiannual_value: semiannualValue,
      annual_value: yearlyValue,
      lifetime_value: lifetimeValue,
      is_free: isFree,
      duration_days: durationDays,
      question_limit: questionLimit,
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

    revalidateTag(CACHE_TAGS.PLANS);
    revalidatePath("/plans");
    revalidatePath(`/plans/${plan.id}`);
    redirect(`/plans`);
  } else {
    return { error: error?.message ?? null };
  }
}
